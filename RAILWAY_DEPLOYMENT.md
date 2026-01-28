# Railway Deployment Quick Start

This guide provides step-by-step instructions for deploying to Railway.

## Prerequisites

- Railway account: https://railway.app
- GitHub account (for repository connection)
- This project pushed to GitHub

## Deployment Steps

### 1. Create New Project

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Choose "Deploy Now"

### 2. Add PostgreSQL Database

1. In your project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway creates the database automatically
4. Copy the `DATABASE_URL` from the database variables

### 3. Configure Kratos Service

1. Click "+ New" → "Empty Service"
2. Name it "kratos-backend"
3. In Settings:
   - Source: Connect to your GitHub repo
   - Root Directory: `backend`
   - Build: Dockerfile detected automatically

4. Add Variables:
```bash
DSN=${{Postgres.DATABASE_URL}}
SERVE_PUBLIC_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
SERVE_ADMIN_BASE_URL=http://kratos-backend.railway.internal:4434
SELFSERVICE_DEFAULT_BROWSER_RETURN_URL=https://your-frontend-url.up.railway.app
SELFSERVICE_ALLOWED_RETURN_URLS=https://your-frontend-url.up.railway.app
SECRETS_DEFAULT=your-super-secret-key-at-least-32-characters-long
COURIER_SMTP_CONNECTION_URI=smtp://username:password@smtp.mailtrap.io:2525
COURIER_SMTP_FROM_ADDRESS=noreply@yourdomain.com
COURIER_SMTP_FROM_NAME=Your App Name
```

5. In Settings → Networking:
   - Click "Generate Domain"
   - Copy the generated domain (e.g., `kratos-backend-production.up.railway.app`)

6. Update `SERVE_PUBLIC_BASE_URL` with your generated domain

### 4. Configure Frontend Service

1. Click "+ New" → "Empty Service"
2. Name it "frontend"
3. In Settings:
   - Source: Same GitHub repo
   - Root Directory: `frontend`
   - Build: Dockerfile detected automatically

4. Add Variables:
```bash
NEXT_PUBLIC_KRATOS_PUBLIC_URL=https://your-kratos-domain.up.railway.app
NEXT_PUBLIC_APP_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
```

5. In Settings → Networking:
   - Click "Generate Domain"
   - Copy the generated domain

6. **IMPORTANT**: Update Kratos variables:
   - Go back to kratos-backend service
   - Update these variables with your frontend domain:
     - `SELFSERVICE_DEFAULT_BROWSER_RETURN_URL`
     - `SELFSERVICE_ALLOWED_RETURN_URLS`

### 5. Deploy Services

1. Both services should deploy automatically
2. Watch the build logs for any errors
3. Wait for both services to show "Active"

### 6. Verify Deployment

1. Open your frontend URL
2. Try registering a new account
3. Check Mailtrap for verification email (if using Mailtrap)
4. Test login, recovery, and settings flows

## Environment Variable Checklist

### Kratos Backend
- [ ] DSN (PostgreSQL connection)
- [ ] SERVE_PUBLIC_BASE_URL (Kratos public URL)
- [ ] SERVE_ADMIN_BASE_URL (Kratos internal URL)
- [ ] SELFSERVICE_DEFAULT_BROWSER_RETURN_URL (Frontend URL)
- [ ] SELFSERVICE_ALLOWED_RETURN_URLS (Frontend URL)
- [ ] SECRETS_DEFAULT (32+ character secret)
- [ ] COURIER_SMTP_CONNECTION_URI (SMTP credentials)
- [ ] COURIER_SMTP_FROM_ADDRESS (Email address)
- [ ] COURIER_SMTP_FROM_NAME (Sender name)

### Frontend
- [ ] NEXT_PUBLIC_KRATOS_PUBLIC_URL (Kratos public URL)
- [ ] NEXT_PUBLIC_APP_URL (Frontend URL)

## Common Issues

### "Flow expired" Error
- Issue: Kratos flow IDs expire after 10 minutes
- Solution: This is normal behavior, user needs to restart the flow

### CORS Error
- Issue: Frontend can't communicate with Kratos
- Solution: Ensure `SELFSERVICE_ALLOWED_RETURN_URLS` exactly matches frontend URL

### Emails Not Sending
- Issue: SMTP configuration incorrect
- Solution: Verify SMTP credentials and connection URI format

### Database Connection Failed
- Issue: Kratos can't connect to PostgreSQL
- Solution: Ensure `DSN` uses the correct Railway PostgreSQL URL

### Frontend Shows 500 Error
- Issue: Environment variables not set correctly
- Solution: Check all `NEXT_PUBLIC_*` variables are set

## Production Checklist

Before going live:

- [ ] Use a strong secret for `SECRETS_DEFAULT`
- [ ] Configure production SMTP (SendGrid, AWS SES, etc.)
- [ ] Set up custom domain in Railway
- [ ] Update all URLs to use custom domain
- [ ] Enable HTTPS (Railway provides this automatically)
- [ ] Test all authentication flows
- [ ] Monitor logs for errors
- [ ] Set up database backups
- [ ] Configure rate limiting (if needed)
- [ ] Review and adjust Kratos session timeouts

## Updating Your Deployment

When you push changes to GitHub:

1. Railway automatically detects the change
2. Triggers a new build
3. Deploys if build succeeds
4. Zero-downtime deployment

To manually redeploy:
1. Go to service in Railway dashboard
2. Click "Deployments" tab
3. Click "Redeploy" on latest deployment

## Viewing Logs

1. Go to your service in Railway dashboard
2. Click "Deployments" tab
3. Click on a deployment
4. View "Build Logs" and "Deploy Logs"

Or use Railway CLI:
```bash
railway logs
```

## Cost Estimation

Railway Pricing (as of 2024):
- Hobby Plan: $5/month + usage
- PostgreSQL: Included
- Services: ~$5-10/month each (depends on usage)

Estimated monthly cost: $15-25 for small-scale application

## Getting Help

- Railway Discord: https://discord.gg/railway
- Ory Slack: https://slack.ory.sh
- GitHub Issues: Open an issue in your repository
