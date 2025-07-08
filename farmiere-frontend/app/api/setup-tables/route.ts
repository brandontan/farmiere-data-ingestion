import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const setupSQL = `
      -- Create upload_history table for duplicate file detection
      CREATE TABLE IF NOT EXISTS upload_history (
        id SERIAL PRIMARY KEY,
        file_hash VARCHAR(64) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        data_source VARCHAR(50) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        rows_inserted INTEGER NOT NULL DEFAULT 0,
        upload_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_upload_history_file_hash ON upload_history(file_hash);
      CREATE INDEX IF NOT EXISTS idx_upload_history_data_source ON upload_history(data_source);
      CREATE INDEX IF NOT EXISTS idx_upload_history_upload_date ON upload_history(upload_date);

      -- Create unique constraint to prevent duplicate hash + data_source combinations
      CREATE UNIQUE INDEX IF NOT EXISTS idx_upload_history_unique 
      ON upload_history(file_hash, data_source);
    `

    const { error } = await supabase.rpc('execute_sql', {
      sql: setupSQL
    })

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to create upload_history table', 
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Upload history table created successfully'
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}