# 🚀 Deployment Guide

This guide covers deploying the Mwembeshi Farm Management System using free-tier services optimized for Zambian conditions.

## Recommended Stack (Free Tier)

| Service | Purpose | Free Tier Limits |
|---------|---------|------------------|
| **Vercel** | Frontend + API hosting | 100GB bandwidth/month |
| **Supabase** | PostgreSQL database | 500MB storage, 2GB bandwidth |
| **Cloudinary** | Image storage | 25GB storage, 25GB bandwidth |

## Step-by-Step Deployment

### 1. Supabase Setup (Database)

#### Create Account & Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in:
   - **Project name**: `mwembeshi-farm`
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to Zambia (e.g., `eu-west-2` or `us-east-1`)
4. Click "Create new project" and wait ~2 minutes

#### Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2. Vercel Deployment

#### Connect Repository
1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or your app folder)

#### Add Environment Variables
In Vercel project settings, add these environment variables:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-min-32-chars

NEXT_PUBLIC_APP_NAME=Mwembeshi Farm
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

#### Deploy
1. Click "Deploy"
2. Wait for build to complete (~3-5 minutes)
3. Your app will be live at `your-app.vercel.app`

### 3. Run Database Migrations

After deployment, you need to run migrations:

#### Option A: Local Migration (Recommended)
```bash
# Set the DATABASE_URL in your local .env file
DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Seed initial data
npx prisma db seed
```

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Run migration in production
vercel env pull .env.local
npx prisma migrate deploy
```

### 4. Custom Domain (Optional)

1. In Vercel, go to **Settings** → **Domains**
2. Add your domain (e.g., `farm.yourdomain.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable

## Alternative Hosting Options

### Railway (Good for Africa)
- Better latency for African users
- Free tier: $5 credit/month
- Setup:
  1. Go to [railway.app](https://railway.app)
  2. Create PostgreSQL + Node.js services
  3. Connect GitHub repo
  4. Add environment variables

### Render
- Free tier with PostgreSQL
- Setup:
  1. Go to [render.com](https://render.com)
  2. Create Web Service from repo
  3. Create PostgreSQL database
  4. Connect services

### Fly.io (Best Performance for Africa)
- Edge deployment closer to Zambia
- Setup requires CLI:
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login and deploy
fly auth login
fly launch
fly deploy
```

## Performance Optimization for Zambia

### 1. Enable Compression
Already configured in `next.config.js`:
```javascript
module.exports = {
  compress: true,
  // ...
}
```

### 2. Image Optimization
Use Next.js Image component:
```tsx
import Image from 'next/image';
<Image src="/animal.jpg" width={400} height={300} quality={75} />
```

### 3. Caching Strategy
PWA caching is configured for:
- Static assets: 30 days
- API responses: 5 minutes
- Images: 7 days

### 4. Reduce Bundle Size
- Dynamic imports for large components
- Tree-shaking enabled by default
- Avoid large dependencies

## Monitoring & Maintenance

### Vercel Analytics (Free)
1. Enable in Vercel dashboard
2. View page load times, errors

### Database Monitoring
1. Supabase dashboard shows:
   - Query performance
   - Storage usage
   - Connection count

### Backup Strategy
```bash
# Manual backup (run weekly)
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore if needed
psql $DATABASE_URL < backup_file.sql
```

## Costs (Free Tier Limits)

| Service | Limit | What Happens After |
|---------|-------|-------------------|
| Vercel | 100GB bandwidth | Upgrade to Pro ($20/mo) |
| Supabase | 500MB database | Upgrade to Pro ($25/mo) |
| Images | Included in Supabase | - |

**For a small farm**: Free tier should last 6-12 months

**Estimated monthly cost after scaling**: $25-50/month

## Troubleshooting

### Database Connection Errors
```
Error: Can't reach database server
```
**Solution**: Check if `?pgbouncer=true` is in connection string

### Build Failures
```
Error: Prisma Client not generated
```
**Solution**: Ensure `postinstall` script runs `prisma generate`

### Slow Performance
**Solutions**:
1. Enable caching in API routes
2. Use `revalidate` in server components
3. Check database indexes

## Support Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)
