import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { fileHash, fileName, dataSource } = await request.json()

    if (!fileHash || !fileName || !dataSource) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Check for duplicate file hash in ANY data source
    const { data: duplicateFile, error } = await supabaseServer
      .from('upload_history')
      .select('*')
      .eq('file_hash', fileHash)
      .limit(1)

    // Also check for same filename in ANY data source
    const { data: duplicateFileName, error: filenameError } = await supabaseServer
      .from('upload_history')
      .select('*')
      .eq('original_filename', fileName)
      .limit(1)

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error checking for duplicates:', error)
      return NextResponse.json({ 
        error: 'Failed to check for duplicates',
        details: error.message 
      }, { status: 500 })
    }

    // Check for same content in any data source
    if (duplicateFile && duplicateFile.length > 0) {
      const duplicate = duplicateFile[0]
      return NextResponse.json({
        isDuplicate: true,
        type: 'content',
        uploadDate: duplicate.upload_date,
        originalFileName: duplicate.original_filename,
        dataSource: duplicate.data_source,
        uploadId: duplicate.id
      })
    }

    // Check for same filename in any data source (different restriction)
    if (duplicateFileName && duplicateFileName.length > 0 && (!filenameError || (filenameError as any).code !== 'PGRST116')) {
      const duplicate = duplicateFileName[0]
      return NextResponse.json({
        isDuplicate: true,
        type: 'filename',
        uploadDate: duplicate.upload_date,
        originalFileName: duplicate.original_filename,
        dataSource: duplicate.data_source,
        uploadId: duplicate.id
      })
    }

    return NextResponse.json({
      isDuplicate: false
    })

  } catch (error) {
    console.error('Error checking for duplicate file:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}