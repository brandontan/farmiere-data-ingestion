import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { fileHash, fileName, dataSource } = await request.json()

    if (!fileHash || !fileName || !dataSource) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Check for duplicate file hash in upload history
    const { data: duplicateFile, error } = await supabase
      .from('upload_history')
      .select('*')
      .eq('file_hash', fileHash)
      .eq('data_source', dataSource)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error checking for duplicates:', error)
      return NextResponse.json({ 
        error: 'Failed to check for duplicates',
        details: error.message 
      }, { status: 500 })
    }

    if (duplicateFile) {
      return NextResponse.json({
        isDuplicate: true,
        uploadDate: duplicateFile.upload_date,
        originalFileName: duplicateFile.original_filename,
        uploadId: duplicateFile.id
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