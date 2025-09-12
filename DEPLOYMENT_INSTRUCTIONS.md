# Zelion Network Deployment Instructions

## Production Build Ready ✅

The application has been successfully built for production. Follow these steps to deploy:

## Option 1: Deploy to Netlify (Recommended)

### Via Netlify CLI
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod --dir=.next
```

### Via Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `.next` folder
3. Configure environment variables if needed
4. Your site will be live!

## Option 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Option 3: Deploy to Custom Server

### Requirements
- Node.js 18+ 
- PM2 (for process management)

### Steps
```bash
# Build the application
npm run build

# Start production server
npm run start

# Or use PM2
pm2 start npm --name "zelion-network" -- start
```

## Environment Variables

Create a `.env.production` file:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_id
```

## Post-Deployment Checklist

- [ ] Verify all pages load correctly
- [ ] Test wallet connection
- [ ] Confirm contract interactions work
- [ ] Check responsive design on mobile
- [ ] Verify HTTPS is enabled
- [ ] Test all DeFi features:
  - [ ] Faucet claims
  - [ ] Staking/unstaking
  - [ ] Token swaps
  - [ ] Bridge transfers
- [ ] Monitor error logs

## Custom Domain Setup

### Netlify
1. Go to Domain Settings
2. Add custom domain
3. Configure DNS:
   - A Record: 75.2.60.5
   - CNAME: [your-site].netlify.app

### Vercel
1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS configuration

## Production URLs

- Netlify: `https://zelion-network.netlify.app`
- Vercel: `https://zelion-network.vercel.app`
- Custom: `https://zelion.network` (when configured)

## Build Output

The production build created:
- Optimized JavaScript bundles
- Static HTML pages
- Compressed assets
- SEO optimizations

Build stats:
- Total pages: 15
- Build time: ~65 seconds
- All pages successfully compiled ✅

## Support

If you encounter deployment issues:
1. Check build logs for errors
2. Verify Node.js version (18+)
3. Clear cache and rebuild
4. Contact support@zelion.network

---
*Generated: January 2025*
