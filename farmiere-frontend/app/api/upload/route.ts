import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD REQUEST STARTED ===')
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tableName = formData.get('tableName') as string
    const createTable = formData.get('createTable') === 'true'
    const appendMode = formData.get('appendMode') === 'true'
    const fileName = formData.get('fileName') as string
    const dataSource = formData.get('dataSource') as string
    const fileHash = formData.get('fileHash') as string

    console.log('Upload parameters:', {
      fileName,
      tableName,
      dataSource,
      fileSize: file?.size,
      fileType: file?.type
    })

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!tableName) {
      return NextResponse.json({ error: 'No table name provided' }, { status: 400 })
    }

    // Validate file type
    const validationError = validateFile(file)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    // Read and parse CSV file
    console.log('Reading CSV file...')
    const text = await file.text()
    console.log(`CSV file size: ${text.length} characters`)
    
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => {
        // Clean header names for database compatibility
        return header
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
          .replace(/^_+|_+$/g, '')
          .replace(/_+/g, '_')
      }
    })

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors)
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 })
    }

    const data = parseResult.data as Record<string, any>[]
    console.log(`Parsed CSV: ${data.length} rows`)
    
    if (data.length === 0) {
      console.error('No data found in CSV file')
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 })
    }

    // Get column names and infer types
    const columns = Object.keys(data[0])
    const columnTypes = inferColumnTypes(data, columns)
    console.log('CSV columns:', columns)
    console.log('Inferred column types:', columnTypes)

    // Check if upload_history table exists (created via migration)
    const { error: historyCheckError } = await supabaseServer
      .from('upload_history')
      .select('id')
      .limit(1)
    
    if (historyCheckError && historyCheckError.code === 'PGRST106') {
      return NextResponse.json({ 
        error: 'Database not properly initialized. upload_history table missing.' 
      }, { status: 500 })
    }

    let tableWasCreated = false
    
    // Check if target table exists, create if it doesn't
    const { error: tableCheckError } = await supabaseServer
      .from(tableName)
      .select('*')
      .limit(1)
    
    if (tableCheckError && tableCheckError.code === 'PGRST106') {
      // Table doesn't exist - return error instead of creating
      return NextResponse.json({ 
        error: `Table '${tableName}' does not exist. Please create the table first or use an existing table.`,
        tableName,
        suggestions: [
          'Use one of the existing temp tables: temp_tiktok_data, temp_shopee_data, temp_aipost_data, temp_goaffpro_data',
          'Or create the table manually in Supabase first'
        ]
      }, { status: 400 })
    }
    
    // No table creation logic needed since we disabled it

    // Insert data with transaction safety
    console.log('Starting data insertion...')
    const batchSize = 100
    let insertedCount = 0
    const errors: string[] = []
    const insertedBatches: any[][] = []

    try {
      for (let i = 0; i < data.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1
        const batch = data.slice(i, i + batchSize)
        console.log(`Processing batch ${batchNumber}: ${batch.length} rows`)
        
        // For temp tables, store data as JSONB
        const cleanedBatch = batch.map(row => {
          if (tableName.startsWith('temp_')) {
            // Store entire row as JSONB in data column
            return { data: row }
          } else {
            // Normal table with individual columns
            const cleanedRow: Record<string, any> = {}
            for (const [key, value] of Object.entries(row)) {
              cleanedRow[key] = cleanValue(value, columnTypes[key])
            }
            return cleanedRow
          }
        })

        console.log(`Batch ${batchNumber} cleaned data sample:`, cleanedBatch[0])
        console.log(`Inserting batch ${batchNumber} into table: ${tableName}`)

        const { data: insertedData, error: insertError } = await supabaseServer
          .from(tableName)
          .insert(cleanedBatch)
          .select()

        if (insertError) {
          // Log detailed error for debugging
          console.error('Insert error details:', {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            code: insertError.code,
            hint: insertError.hint
          })
          
          // If any batch fails, rollback all previous inserts
          let errorMessage = 'Unknown error'
          if (insertError.message) {
            errorMessage = insertError.message
          } else if (insertError.details) {
            errorMessage = insertError.details
          } else if (insertError.code) {
            errorMessage = `Error code: ${insertError.code}`
          } else if (Object.keys(insertError).length === 0) {
            // Empty error object - likely a timing/network issue
            errorMessage = 'Table may not be ready for insertion. Please try again in a few seconds.'
          } else {
            errorMessage = JSON.stringify(insertError)
          }
          
          if (insertedBatches.length > 0) {
            console.log('Rolling back previous inserts due to batch failure...')
            // Note: PostgreSQL doesn't support cross-batch rollback easily
            // In production, use proper database transactions
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMessage}`)
            errors.push('WARNING: Previous batches were inserted successfully. Manual cleanup may be required.')
          } else {
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${errorMessage}`)
          }
          break // Stop processing on first error
        } else {
          console.log(`Batch ${batchNumber} inserted successfully: ${cleanedBatch.length} rows`)
          console.log(`Batch ${batchNumber} result sample:`, insertedData?.[0] || 'No data returned')
          insertedCount += cleanedBatch.length
          insertedBatches.push(cleanedBatch)
        }
      }
    } catch (error) {
      errors.push(`Unexpected error during data insertion: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Record upload in history table for duplicate detection
    let historyRecordId: string | null = null
    if (fileHash && fileName && dataSource) {
      try {
        if (insertedCount > 0) {
          // Only record successful uploads
          const { data: historyData } = await supabaseServer
            .from('upload_history')
            .insert({
              file_hash: fileHash,
              original_filename: fileName,
              data_source: dataSource,
              table_name: tableName,
              rows_inserted: insertedCount,
              upload_date: new Date().toISOString()
            })
            .select()
          
          if (historyData && historyData[0]) {
            historyRecordId = historyData[0].id
          }
        } else {
          // If no rows were inserted, clean up any existing history for this file
          await supabaseServer
            .from('upload_history')
            .delete()
            .eq('file_hash', fileHash)
            .eq('data_source', dataSource)
            .eq('original_filename', fileName)
            
          console.log(`Cleaned up failed upload history for ${fileName}`)
        }
      } catch (historyError) {
        console.warn('Failed to manage upload history:', historyError)
        // Don't fail the upload if history recording fails
      }
    }

    // Determine success status
    const success = errors.length === 0 && insertedCount > 0
    const partialSuccess = errors.length > 0 && insertedCount > 0
    
    console.log('=== UPLOAD SUMMARY ===')
    console.log(`Total rows processed: ${data.length}`)
    console.log(`Rows successfully inserted: ${insertedCount}`)
    console.log(`Errors encountered: ${errors.length}`)
    console.log(`Success: ${success}, Partial success: ${partialSuccess}`)
    if (errors.length > 0) {
      console.log('Error details:', errors)
    }
    console.log('=== END UPLOAD SUMMARY ===')
    
    return NextResponse.json({
      success,
      partialSuccess,
      message: success 
        ? `Successfully processed ${insertedCount} records`
        : partialSuccess 
        ? `Partially successful: ${insertedCount} records inserted, ${errors.length} errors`
        : 'Upload failed',
      totalRows: data.length,
      insertedRows: insertedCount,
      failedRows: data.length - insertedCount,
      errors: errors.length > 0 ? errors : undefined,
      columns,
      tableName,
      warnings: insertedCount > 0 && errors.length > 0 ? ['Some data was inserted successfully before errors occurred'] : undefined
    })

  } catch (error) {
    console.error('=== CRITICAL UPLOAD ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Full error object:', error)
    console.error('=== END CRITICAL ERROR ===')
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function inferColumnTypes(data: Record<string, any>[], columns: string[]): Record<string, string> {
  const types: Record<string, string> = {}
  
  for (const column of columns) {
    const values = data.slice(0, 100).map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '')
    
    if (values.length === 0) {
      types[column] = 'TEXT'
      continue
    }

    const isAllNumbers = values.every(v => !isNaN(Number(v)))
    const isAllIntegers = isAllNumbers && values.every(v => Number.isInteger(Number(v)))
    const isAllBooleans = values.every(v => 
      typeof v === 'boolean' || 
      ['true', 'false', '1', '0', 'yes', 'no'].includes(String(v).toLowerCase())
    )

    if (isAllBooleans) {
      types[column] = 'BOOLEAN'
    } else if (isAllIntegers) {
      types[column] = 'INTEGER'
    } else if (isAllNumbers) {
      types[column] = 'DECIMAL'
    } else {
      types[column] = 'TEXT'
    }
  }
  
  return types
}

function generateCreateTableSQL(tableName: string, columnTypes: Record<string, string>): string {
  const columns = Object.entries(columnTypes)
    .map(([name, type]) => `"${name}" ${type}`)
    .join(',\n  ')
  
  return `
    CREATE TABLE IF NOT EXISTS "${tableName}" (
      id SERIAL PRIMARY KEY,
      ${columns},
      created_at TIMESTAMP DEFAULT NOW()
    );
  `
}

async function createTableDynamically(createTableSQL: string, tableName: string): Promise<{error?: string}> {
  try {
    console.log(`=== CREATING TABLE: ${tableName} ===`)
    console.log('SQL to execute:', createTableSQL)
    
    // Use the database function we created to dynamically create tables
    const { data, error } = await supabaseServer.rpc('create_table_if_not_exists', {
      table_name_param: tableName,
      table_sql_param: createTableSQL
    })

    if (error) {
      console.error('=== TABLE CREATION FAILED ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('=== END TABLE CREATION ERROR ===')
      return { error: error.message }
    }

    console.log(`=== TABLE CREATION SUCCESS ===`)
    console.log('Function result:', data)
    console.log(`Table ${tableName} creation completed`)
    console.log('=== END TABLE CREATION ===')
    return {}
  } catch (error) {
    console.error('=== TABLE CREATION EXCEPTION ===')
    console.error('Exception type:', typeof error)
    console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Exception stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('=== END TABLE CREATION EXCEPTION ===')
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function validateFile(file: File): string | null {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return 'File must have .csv extension'
  }

  // Check MIME type (more permissive for CSV files)
  const validMimeTypes = [
    'text/csv',
    'text/plain',
    'application/csv',
    'application/vnd.ms-excel',
    'application/octet-stream' // Common for CSV files uploaded via curl/forms
  ]
  
  // Only reject if we have a MIME type and it's clearly not CSV-related
  if (file.type && !validMimeTypes.includes(file.type) && 
      !file.type.includes('csv') && 
      !file.type.includes('text') &&
      !file.type.includes('excel')) {
    return `Invalid file type. Expected CSV file, got: ${file.type}`
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return `File too large. Maximum size is 50MB, got ${Math.round(file.size / 1024 / 1024)}MB`
  }

  // Check minimum file size (empty file check)
  if (file.size < 10) {
    return 'File appears to be empty'
  }

  return null
}

function cleanValue(value: any, type: string): any {
  if (value === null || value === undefined || value === '') {
    return null
  }

  switch (type) {
    case 'INTEGER':
      const intVal = parseInt(String(value))
      return isNaN(intVal) ? null : intVal
    case 'DECIMAL':
      const floatVal = parseFloat(String(value))
      return isNaN(floatVal) ? null : floatVal
    case 'BOOLEAN':
      const strVal = String(value).toLowerCase()
      if (['true', '1', 'yes', 'y'].includes(strVal)) return true
      if (['false', '0', 'no', 'n'].includes(strVal)) return false
      return null
    default:
      return String(value)
  }
}