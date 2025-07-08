# 🚨 DEPLOYMENT CHECKLIST - MUST COMPLETE BEFORE DEPLOYING

## CRITICAL SECURITY STEPS

### 1. Rotate Supabase Credentials (IMMEDIATE)
- [ ] Go to Supabase Dashboard > Settings > API
- [ ] Regenerate service role key
- [ ] Update `.env.local` with new key
- [ ] NEVER commit these keys to git

### 2. Set Up Vercel Environment Variables
Go to Vercel Dashboard > Project Settings > Environment Variables:
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = your_supabase_url
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_anon_key (NOT service role!)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = your_service_role_key (server-side only)
- [ ] `API_SECRET_KEY` = generate a random string for API protection

### 3. Enable Row Level Security (RLS)
Run in Supabase SQL Editor:
```sql
-- Enable RLS on all tables
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_tiktok_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_shopee_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_aipost_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE temp_goaffpro_data ENABLE ROW LEVEL SECURITY;

-- Create a policy for service role (temporary)
CREATE POLICY "Service role can do everything" ON upload_history
  FOR ALL USING (auth.role() = 'service_role');
-- Repeat for other tables
```

### 4. Test Locally with Production Config
```bash
# Create .env.production.local with Vercel env vars
npm run build
npm run start
```

### 5. Deploy to Vercel
```bash
vercel --prod
```

## POST-DEPLOYMENT

### Monitor for Issues
- [ ] Check Vercel Functions logs
- [ ] Monitor Supabase usage
- [ ] Test upload functionality

### Future Security Improvements
- [ ] Implement proper authentication (NextAuth.js)
- [ ] Add rate limiting
- [ ] Set up monitoring/alerting
- [ ] Add CORS configuration
- [ ] Implement proper user roles

## ⚠️ WARNING
Do NOT deploy without completing the critical security steps above.
Your database is currently vulnerable if you deploy as-is.