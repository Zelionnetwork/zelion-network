# Vercel Deployment Guide for Zelion Network

## Prerequisites
- Vercel account with access to `zelion.network` domain
- GitHub repository pushed to development branch
- Vercel CLI installed: `npm install -g vercel`

## Deployment Steps

### Option 1: Via Vercel CLI (Recommended)
```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Link to existing project (if zelion.network already exists)
vercel link
```

### Option 2: Via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Import Project"
3. Connect GitHub repository: `Zelionnetwork/zelion-network`
4. Select `development` branch
5. Set root directory to `zelion-site/` (if needed)
6. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Option 3: Update Existing Deployment
If `zelion.network` already exists on Vercel:
1. Go to project settings
2. Update Git repository to point to new branch
3. Trigger new deployment

## Environment Variables (if needed)
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
```

## Custom Domain Configuration
1. Go to Project Settings → Domains
2. Verify `zelion.network` is configured
3. DNS should point to Vercel:
   - A Record: 76.76.19.61
   - CNAME: cname.vercel-dns.com

## Build Configuration
- Framework: Next.js
- Node.js Version: 18.x
- Build Command: `npm run build`
- Output Directory: `.next`

## Post-Deployment Checklist
- [ ] Verify all pages load correctly
- [ ] Test wallet connection
- [ ] Confirm contract interactions work
- [ ] Check faucet balance display and cooldown
- [ ] Test staking with correct APY display
- [ ] Verify swap functionality
- [ ] Test bridge transfers
- [ ] Confirm responsive design

## Differences from Netlify
- Removed `output: 'export'` from next.config.mjs
- Uses server-side rendering instead of static export
- Better performance for dynamic content
- Automatic edge caching

## Rollback Plan
If issues occur:
1. Revert to previous deployment in Vercel dashboard
2. Or redeploy from previous Git commit
3. Netlify backup available at: https://zelion-bridge.windsurf.build/

---
*Updated: January 2025*
