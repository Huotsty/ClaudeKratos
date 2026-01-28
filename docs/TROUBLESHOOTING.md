# Troubleshooting Guide

Common issues and their solutions when deploying Ory Kratos on Railway.

## Table of Contents
- [Deployment Issues](#deployment-issues)
- [Authentication Flows](#authentication-flows)
- [CORS and Networking](#cors-and-networking)
- [Email and SMTP](#email-and-smtp)
- [Database Issues](#database-issues)
- [Performance Issues](#performance-issues)

## Deployment Issues

### Build Failed on Railway

**Symptoms:**
- Build fails during Railway deployment
- Dockerfile errors in logs

**Solutions:**

1. Check Dockerfile syntax:
```bash
# Test build locally
docker build -t test-build ./backend
docker build -t test-build ./frontend
```

2. Verify root directory settings:
   - Backend service: Root directory should be `backend`
   - Frontend service: Root directory should be `frontend`

3. Check build logs in Railway dashboard for specific errors

### Service Won't Start

**Symptoms:**
- Service shows "Crashed" status
- Container exits immediately

**Solutions:**

1. Check environment variables are set correctly
2. View deploy logs for error messages
3. Ensure database is running and accessible
4. Verify Dockerfile CMD is correct

### Health Check Failing

**Symptoms:**
- Service restarts repeatedly
- Health check timeout errors

**Solutions:**

1. Test health endpoint manually:
```bash
curl https://your-kratos-domain.railway.app/health/ready
```

2. Increase health check timeout in railway.json:
```json
{
  "deploy": {
    "healthcheckTimeout": 200
  }
}
```

3. Check if migrations are taking too long

## Authentication Flows

### "Flow Expired" Error

**Symptoms:**
- User gets "flow expired" message
- Happens after 10 minutes

**Explanation:**
This is normal Kratos behavior. Flows expire for security.

**Solutions:**

1. User should restart the flow
2. Reduce flow lifespan in kratos.yml if needed:
```yaml
selfservice:
  flows:
    login:
      lifespan: 5m  # Reduce from 10m
```

### Registration Not Creating User

**Symptoms:**
- Form submits but user not created
- No error message shown

**Solutions:**

1. Check Kratos logs:
```bash
railway logs --service kratos-backend
```

2. Verify identity schema is valid:
```bash
# Validate locally
docker-compose run --rm kratos validate identity-schema backend/identity.schema.json
```

3. Check database connection and migrations

### Login Redirects to Wrong URL

**Symptoms:**
- After login, redirects to localhost
- Redirects to incorrect domain

**Solutions:**

1. Update environment variables:
```bash
SELFSERVICE_DEFAULT_BROWSER_RETURN_URL=https://your-actual-frontend.railway.app
SELFSERVICE_ALLOWED_RETURN_URLS=https://your-actual-frontend.railway.app
```

2. Ensure no trailing slashes in URLs
3. Redeploy Kratos after changing variables

### Session Not Persisting

**Symptoms:**
- User logs in but immediately logged out
- Session cookie not set

**Solutions:**

1. Check cookie settings in browser DevTools
2. Ensure HTTPS is used (Railway provides this)
3. Verify CORS configuration in kratos.yml:
```yaml
serve:
  public:
    cors:
      enabled: true
      allowed_origins:
        - https://your-frontend.railway.app
      allow_credentials: true
```

4. Check if cookies are blocked by browser settings

## CORS and Networking

### CORS Error in Browser Console

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**

1. Check Kratos CORS configuration in kratos.yml:
```yaml
serve:
  public:
    cors:
      enabled: true
      allowed_origins:
        - env://SELFSERVICE_ALLOWED_RETURN_URLS
      allow_credentials: true
```

2. Verify environment variable matches frontend exactly:
```bash
# Must match exactly (no trailing slash)
SELFSERVICE_ALLOWED_RETURN_URLS=https://your-frontend.railway.app
```

3. Test with wildcard (ONLY for debugging):
```yaml
allowed_origins:
  - "*"
```

### Can't Connect to Kratos from Frontend

**Symptoms:**
- Network errors
- Connection refused

**Solutions:**

1. Verify Kratos public URL is accessible:
```bash
curl https://your-kratos-domain.railway.app/health/ready
```

2. Check frontend environment variable:
```bash
NEXT_PUBLIC_KRATOS_PUBLIC_URL=https://your-kratos-domain.railway.app
```

3. Ensure Kratos public port (4433) is exposed in Dockerfile

### Admin API Not Accessible

**Symptoms:**
- Can't access admin endpoints
- 404 on admin routes

**Explanation:**
Admin API should only be accessible internally.

**Solutions:**

1. Use Railway private networking:
```bash
SERVE_ADMIN_BASE_URL=http://kratos-backend.railway.internal:4434
```

2. For testing, temporarily expose admin port, but remove in production

## Email and SMTP

### Emails Not Being Sent

**Symptoms:**
- No verification/recovery emails received
- No errors in UI

**Solutions:**

1. Check Kratos logs for SMTP errors:
```bash
railway logs --service kratos-backend | grep -i smtp
```

2. Verify SMTP credentials:
```bash
# Test SMTP connection
telnet smtp.mailtrap.io 2525
```

3. Check SMTP URI format:
```bash
# Correct format
COURIER_SMTP_CONNECTION_URI=smtp://username:password@smtp.mailtrap.io:2525

# With TLS
COURIER_SMTP_CONNECTION_URI=smtps://username:password@smtp.gmail.com:465
```

4. Verify from address is not blocked by SMTP provider

### Emails Go to Spam

**Solutions:**

1. Configure SPF, DKIM, DMARC records for your domain
2. Use reputable SMTP provider (SendGrid, AWS SES)
3. Ensure from address matches domain
4. Add unsubscribe link in templates

### Email Templates Not Customized

**Solutions:**

1. Mount custom templates in Dockerfile:
```dockerfile
COPY email_templates/ /etc/config/kratos/email_templates/
```

2. Reference templates in kratos.yml:
```yaml
courier:
  template_override_path: /etc/config/kratos/email_templates
```

## Database Issues

### Migration Fails on Startup

**Symptoms:**
- Kratos crashes on start
- Migration error in logs

**Solutions:**

1. Check database connection:
```bash
railway run psql $DATABASE_URL
```

2. Manually run migrations:
```bash
railway run --service kratos-backend kratos migrate sql -e --yes
```

3. Check if database user has sufficient permissions
4. Verify DSN format is correct

### "Too Many Connections" Error

**Symptoms:**
- Connection refused errors
- "too many clients" in logs

**Solutions:**

1. Check current connections:
```sql
SELECT count(*) FROM pg_stat_activity;
```

2. Reduce max connections in Kratos (if needed)
3. Upgrade Railway database plan
4. Add connection pooling

### Data Not Persisting

**Symptoms:**
- Users disappear after restart
- Data loss on redeploy

**Solutions:**

1. Verify using Railway PostgreSQL (not ephemeral storage)
2. Check volume mounting in docker-compose (local only)
3. Ensure DATABASE_URL points to Railway database

## Performance Issues

### Slow Response Times

**Solutions:**

1. Add database indexes:
```sql
CREATE INDEX idx_identities_email ON identities ((traits->>'email'));
```

2. Enable query caching in PostgreSQL
3. Upgrade Railway plan for more resources
4. Use CDN for frontend assets

### High Memory Usage

**Solutions:**

1. Check for memory leaks in logs
2. Upgrade service resources in Railway
3. Optimize database queries
4. Reduce session lifetime

### Rate Limiting Issues

**Symptoms:**
- "Too many requests" errors
- Users getting locked out

**Solutions:**

1. Adjust rate limits in kratos.yml (if configured)
2. Implement Redis for rate limiting
3. Use Cloudflare or similar CDN

## Debugging Tips

### Enable Debug Mode

Temporarily enable debug logging:

```yaml
log:
  level: debug
```

**WARNING:** Don't use in production (exposes sensitive data)

### View Detailed Logs

```bash
# Railway CLI
railway logs --service kratos-backend --tail 100

# Follow logs in real-time
railway logs --service kratos-backend --follow
```

### Test Locally

```bash
# Start all services
docker-compose up

# Test specific flow
curl -X GET http://localhost:4433/self-service/login/browser
```

### Check Environment Variables

```bash
# In Railway shell
railway run --service kratos-backend env | grep KRATOS
```

### Validate Configuration

```bash
# Validate kratos.yml syntax
docker-compose run --rm kratos validate config /etc/config/kratos/kratos.yml
```

## Getting Help

When asking for help, provide:

1. **Error message**: Full error from logs
2. **Steps to reproduce**: What you did before error
3. **Environment**: Railway, local, staging?
4. **Configuration**: Relevant parts of kratos.yml
5. **Logs**: Last 50 lines from service logs

### Support Channels

- **Ory Slack**: https://slack.ory.sh (for Kratos issues)
- **Railway Discord**: https://discord.gg/railway (for Railway issues)
- **GitHub Issues**: For this setup specifically
- **Stack Overflow**: Tag `ory-kratos`

## Preventive Measures

### Before Deploying

- [ ] Test all flows locally
- [ ] Validate configuration files
- [ ] Check all environment variables
- [ ] Test database connection
- [ ] Verify SMTP credentials
- [ ] Review security settings

### After Deploying

- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test recovery flow
- [ ] Test email delivery
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerting
- [ ] Configure backups

### Regular Maintenance

- [ ] Update Kratos version regularly
- [ ] Review and rotate secrets
- [ ] Backup database weekly
- [ ] Monitor resource usage
- [ ] Review access logs
- [ ] Update dependencies
