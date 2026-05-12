# Levay OS - Vercel Deployment Guide

## Quick Deploy (1 minute)

### Option A: Vercel CLI (Recommended)

```bash
# 1. Enter the Next.js app directory
cd apps/levay-os

# 2. Login to Vercel (if not already)
vercel login

# 3. Link project (creates .vercel directory)
vercel link

# 4. Pull existing environment variables
vercel env pull .env.local

# 5. Deploy!
vercel --prod
```

### Option B: GitHub Integration

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "feat: executive dashboard + vercel setup"
git push origin main
```

2. **Go to**: https://vercel.com/new

3. **Import** `sistemainterno-grupo-levay`

4. **Configure**:
   - Framework: Next.js
   - Root Directory: `apps/levay-os`
   - Build Command: `npm run build`

5. **Environment Variables** (in Vercel dashboard):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://anwtivdognjrghipardd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

6. **Deploy** - Click "Deploy"!

---

## After Deploy

The app will be available at: `https://your-project.vercel.app`

The `/executive` page will be at: `https://your-project.vercel.app/executive`

---

## Troubleshooting

**Issue**: "Project not found"
→ Run `vercel link` first

**Issue**: "Missing env vars"
→ Add them in Vercel Dashboard → Settings → Environment Variables

**Issue**: Build fails
→ Check Next.js version compatibility (using 16.2.6)