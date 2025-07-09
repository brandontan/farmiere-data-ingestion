import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST() {
  try {
    // Delete all upload history records where no rows were actually inserted
    const { error, count } = await supabaseServer
      .from('upload_history')
      .delete()
      .eq('rows_inserted', 0)

    if (error) {
      return NextResponse.json({ 
        error: 'Failed to cleanup failed uploads',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: `Cleaned up ${count || 0} failed upload records`,
      deletedCount: count || 0
    })

  } catch (error) {
    console.error('Error cleaning up failed uploads:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}