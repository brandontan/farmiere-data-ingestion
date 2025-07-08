# Data Ingestion App - The Fast Way Guide

## Total Time: 2-3 hours (not 4-5 hours)

This guide shows you how to build a data ingestion app the RIGHT way, avoiding the mistakes that waste hours of debugging time.

## What NOT to Do ❌

1. **Dynamic table creation** - Wasted 2 hours on PostgREST timing issues
2. **Complex retry logic** - The problem is the approach, not the timing
3. **Over-engineering error handling** - Keep it simple
4. **Fighting framework limitations** - Accept constraints instead

## The Right Way ✅

### 1. Project Setup (30 mins)

```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest csv-upload --typescript --tailwind --app
cd csv-upload

# Install dependencies
npm install @supabase/supabase-js papaparse jose resend

# Optional but recommended for better UI
npm install lucide-react
```

### 2. Database Setup - Static Tables Only! (15 mins)

**CRITICAL**: Create all tables upfront in Supabase. Never create tables dynamically.

```sql
-- Create one table per data source with JSONB storage
CREATE TABLE temp_tiktok_data (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE temp_shopee_data (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE temp_aipost_data (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE temp_goaffpro_data (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: Track upload history
CREATE TABLE upload_history (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  table_name TEXT NOT NULL,
  rows_inserted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Core Upload API (45 mins)

Keep it simple - no dynamic tables, no complex retries.

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

// Whitelist of allowed tables - NO DYNAMIC CREATION
const ALLOWED_TABLES = [
  'temp_tiktok_data',
  'temp_shopee_data',
  'temp_aipost_data',
  'temp_goaffpro_data'
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const tableName = formData.get('tableName') as string
    
    // Validate table name
    if (!ALLOWED_TABLES.includes(tableName)) {
      return NextResponse.json({ 
        error: `Invalid table. Use one of: ${ALLOWED_TABLES.join(', ')}` 
      }, { status: 400 })
    }
    
    // Parse CSV
    const text = await file.text()
    const { data, errors } = Papa.parse(text, {
      header: true,
      skipEmptyLines: true
    })
    
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV parsing failed', 
        details: errors 
      }, { status: 400 })
    }
    
    // Insert as JSONB - simple and works every time
    const batch = data.map(row => ({ data: row }))
    
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(batch)
    
    if (insertError) {
      return NextResponse.json({ 
        error: 'Insert failed', 
        details: insertError.message 
      }, { status: 500 })
    }
    
    // Track upload
    await supabase
      .from('upload_history')
      .insert({
        filename: file.name,
        table_name: tableName,
        rows_inserted: data.length
      })
    
    return NextResponse.json({ 
      success: true, 
      rowsInserted: data.length 
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}
```

### 4. Simple Frontend (30 mins)

```typescript
// app/page.tsx
'use client'

import { useState } from 'react'

const DATA_SOURCES = [
  { value: 'temp_tiktok_data', label: 'TikTok Shop' },
  { value: 'temp_shopee_data', label: 'Shopee' },
  { value: 'temp_aipost_data', label: 'aiPost' },
  { value: 'temp_goaffpro_data', label: 'GoAffPro' }
]

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [source, setSource] = useState(DATA_SOURCES[0].value)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tableName', source)
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">CSV Upload</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Data Source</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {DATA_SOURCES.map(ds => (
              <option key={ds.value} value={ds.value}>
                {ds.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block mb-2">CSV File</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        
        {result && (
          <div className={`p-4 rounded ${result.error ? 'bg-red-100' : 'bg-green-100'}`}>
            {result.error || `Success! ${result.rowsInserted} rows uploaded`}
          </div>
        )}
      </div>
    </div>
  )
}
```

### 5. Passwordless Auth (30 mins)

```typescript
// app/api/auth/send-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { Resend } from 'resend'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'change-this'
)

const ALLOWED_EMAILS = [
  'ai.ops@fefifo.co',
  'brandon@n8npro.com',
  'brandontan@gmail.com'
]

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  
  if (!ALLOWED_EMAILS.includes(email)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    )
  }
  
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('10m')
    .sign(SECRET_KEY)
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
    request.headers.get('origin')
  const magicLink = `${baseUrl}/api/auth/verify?token=${token}`
  
  // Send email
  await resend.emails.send({
    from: 'CSV Upload <onboarding@resend.dev>',
    to: [email],
    subject: 'Login Link',
    html: `<a href="${magicLink}">Login</a>`
  })
  
  return NextResponse.json({ success: true })
}
```

### 6. Deploy to Vercel (15 mins)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - JWT_SECRET
# - RESEND_API_KEY
```

## Key Principles

### 1. Accept Constraints
- PostgREST has a schema cache? Use static tables.
- Need flexible data? Use JSONB columns.
- Email verification complex? Use a whitelist.

### 2. Simple > Clever
- No retry logic if the approach is wrong
- No complex error handling for simple operations
- No dynamic anything when static works

### 3. Debug Smarter
- If debugging takes > 30 mins, the approach is wrong
- Test core functionality in isolation first
- Use existing working examples as reference

### 4. Time Estimates
- Setup & Dependencies: 30 mins
- Core functionality: 1 hour
- Authentication: 30 mins
- Polish & Deploy: 30 mins
- **Total: 2.5 hours**

## Common Pitfalls to Avoid

1. **Dynamic Table Creation**
   - PostgREST caches schema for ~10 seconds
   - New tables aren't immediately available
   - Solution: Create all tables upfront

2. **Complex State Management**
   - Don't track upload progress in multiple places
   - Keep state minimal and centralized

3. **Over-Engineering Security**
   - Start with simple email whitelist
   - Add complexity only when needed

4. **Perfectionism**
   - Ship working solution first
   - Iterate based on real usage
   - Don't anticipate problems that don't exist

## When to Push Back

If a requirement adds significant complexity, ask:
1. Does this solve a real problem?
2. Is there a simpler alternative?
3. Can we defer this to v2?

Examples:
- "Dynamic table creation" → "Use pre-created tables with JSONB"
- "Complex permission system" → "Email whitelist for MVP"
- "Real-time progress" → "Simple success/error message"

## Conclusion

The fastest way to build is to work WITH the constraints of your tools, not against them. When you hit a wall after 30 minutes, don't dig deeper - step back and find a different path.

Remember: **Simple solutions that work > Complex solutions that might work**