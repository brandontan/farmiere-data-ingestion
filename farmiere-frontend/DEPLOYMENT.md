# Vercel Deployment Guide

## 🚨 **SECURITY ALERT**

**IMPORTANT**: The exposed Supabase service role key in the code has been removed and replaced with environment variables. You MUST:

1. **Rotate your Supabase service role key immediately** in the Supabase dashboard
2. **Never commit `.env.local` to version control**
3. **Use environment variables in Vercel**

## 📋 Pre-Deployment Checklist

- [ ] Rotate Supabase service role key
- [ ] Update `.env.local` with new credentials
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Test locally with new credentials
- [ ] Remove any remaining hardcoded secrets

## 🚀 Deployment Steps

### 1. Prepare Environment Variables

Create/update `.env.local` with your actual values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
npm i -g vercel
vercel
```

#### Option B: Using GitHub Integration
1. Push code to GitHub (ensure no secrets are committed)
2. Import project in Vercel Dashboard
3. Configure environment variables

### 3. Configure Environment Variables in Vercel

In your Vercel project settings, add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | All |

⚠️ **IMPORTANT**: Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only!

### 4. Security Best Practices

1. **Use Row Level Security (RLS)** in Supabase for production
2. **Consider using Supabase anon key** for client-side operations
3. **Implement API rate limiting** for production
4. **Add authentication** if this will be publicly accessible
5. **Monitor usage** through Supabase dashboard

### 5. Post-Deployment

1. Test all upload flows
2. Verify duplicate detection works
3. Check error handling
4. Monitor Supabase usage

## 🔒 Security Recommendations

### Immediate Actions:
1. **Rotate the exposed service role key NOW**
2. Enable RLS policies in Supabase
3. Consider implementing user authentication

### For Production:
```javascript
// Consider using anon key for client-side
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Keep service role key only for server-side operations
```

## 📚 Additional Resources

- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)

---

⚠️ **Remember**: NEVER commit secrets to version control!