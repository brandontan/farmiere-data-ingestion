import { createClient } from '@supabase/supabase-js'

// This file should only be imported in server-side code (API routes)
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!.trim()

// Create a Supabase client with the service role key for server-side operations
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})