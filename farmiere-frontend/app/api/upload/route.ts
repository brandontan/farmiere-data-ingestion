import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tableName = formData.get('tableName') as string
    const createTable = formData.get('createTable') === 'true'
    const appendMode = formData.get('appendMode') === 'true'
    const fileName = formData.get('fileName') as string
    const dataSource = formData.get('dataSource') as string
    const fileHash = formData.get('fileHash') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!tableName) {
      return NextResponse.json({ error: 'No table name provided' }, { status: 400 })
    }

    // Read and parse CSV file
    const text = await file.text()
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
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: parseResult.errors 
      }, { status: 400 })
    }

    const data = parseResult.data as Record<string, any>[]
    
    if (data.length === 0) {
      return NextResponse.json({ error: 'No data found in CSV' }, { status: 400 })
    }

    // Get column names and infer types
    const columns = Object.keys(data[0])
    const columnTypes = inferColumnTypes(data, columns)

    // Always try to create table if it doesn't exist
    const createTableSQL = generateCreateTableSQL(tableName, columnTypes)
    
    // This will only create table if it doesn't exist (CREATE TABLE IF NOT EXISTS)
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql: createTableSQL
    })

    if (createError && !createError.message.includes('already exists')) {
      return NextResponse.json({ 
        error: 'Failed to create table', 
        details: createError.message 
      }, { status: 500 })
    }

    // Insert data in batches
    const batchSize = 100
    let insertedCount = 0
    const errors: string[] = []

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize)
      
      // Clean and validate data
      const cleanedBatch = batch.map(row => {
        const cleanedRow: Record<string, any> = {}
        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key] = cleanValue(value, columnTypes[key])
        }
        return cleanedRow
      })

      const { error: insertError } = await supabase
        .from(tableName)
        .insert(cleanedBatch)

      if (insertError) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${insertError.message}`)
      } else {
        insertedCount += cleanedBatch.length
      }
    }

    // Record upload in history table for duplicate detection
    if (fileHash && fileName && dataSource) {
      try {
        await supabase
          .from('upload_history')
          .insert({
            file_hash: fileHash,
            original_filename: fileName,
            data_source: dataSource,
            table_name: tableName,
            rows_inserted: insertedCount,
            upload_date: new Date().toISOString()
          })
      } catch (historyError) {
        console.warn('Failed to record upload history:', historyError)
        // Don't fail the upload if history recording fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${insertedCount} records`,
      totalRows: data.length,
      insertedRows: insertedCount,
      errors: errors.length > 0 ? errors : undefined,
      columns,
      tableName
    })

  } catch (error) {
    console.error('Upload error:', error)
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