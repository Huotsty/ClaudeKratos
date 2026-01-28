# Ory Kratos on Railway - Complete Deployment Guide

A production-ready deployment setup for Ory Kratos authentication system with a Next.js frontend on Railway.

## 🏗️ Architecture

- **Backend**: Ory Kratos v1.0.0 for authentication and identity management
- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Database**: PostgreSQL 15 for identity storage
- **Email**: SMTP integration (Mailtrap for testing, configurable for production)

## 📁 Project Structure

```
ClaudeKratos/
├── backend/
│   ├── Dockerfile              # Kratos container configuration
│   ├── railway.json            # Railway deployment config for backend
│   ├── kratos.yml              # Kratos configuration file
│   └── identity.schema.json    # Identity schema definition
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/          # Login page
│   │   │   ├── registration/   # Registration page
│   │   │   ├── recovery/       # Password recovery
│   │   │   ├── verification/   # Email verification
│   │   │   ├── settings/       # Account settings
│   │   │   └── error/          # Error page
│   │   ├── components/
│   │   │   └── FlowComponent.tsx  # Reusable form component
│   │   └── lib/
│   │       └── kratos.ts       # Kratos API client
│   ├── Dockerfile              # Frontend container configuration
│   ├── railway.json            # Railway deployment config for frontend
│   └── package.json            # Node.js dependencies
├── docker-compose.yml          # Local development setup
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🚀 Local Development Setup

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local frontend development)
- Git

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd ClaudeKratos

# Copy environment variables
cp .env.example .env

# Edit .env file with your values
# For local development, the defaults should work
```

### Step 2: Start Services

```bash
# Start all services (PostgreSQL, Kratos, Frontend, Mailslurper)
docker-compose up -d

# Check logs
docker-compose logs -f

# Check if all services are running
docker-compose ps
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Kratos Public API**: http://localhost:4433
- **Kratos Admin API**: http://localhost:4434
- **Mailslurper UI** (Email viewer): http://localhost:4436

### Step 4: Test Authentication

1. Go to http://localhost:3000
2. Click "Register" to create a new account
3. Check http://localhost:4436 for verification emails
4. Test login, recovery, and settings flows

## 🚂 Railway Deployment

### Prerequisites

- Railway account (https://railway.app)
- Railway CLI installed (optional but recommended)

### Step 1: Create Railway Project

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create a new project
railway init
```

### Step 2: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create and configure the database
3. Note the `DATABASE_URL` connection string

### Step 3: Deploy Kratos Backend

1. In Railway dashboard, click "New" → "Empty Service"
2. Name it "kratos"
3. Connect your GitHub repository
4. Set the root directory to `/backend`
5. Add environment variables:

```
DSN=${{Postgres.DATABASE_URL}}
SERVE_PUBLIC_BASE_URL=https://kratos-production.up.railway.app
SERVE_ADMIN_BASE_URL=http://kratos.railway.internal:4434
SELFSERVICE_DEFAULT_BROWSER_RETURN_URL=https://your-frontend.up.railway.app
SELFSERVICE_ALLOWED_RETURN_URLS=https://your-frontend.up.railway.app
SECRETS_DEFAULT=<generate-a-32-char-secret>
COURIER_SMTP_CONNECTION_URI=smtp://username:password@smtp.mailtrap.io:2525
COURIER_SMTP_FROM_ADDRESS=noreply@example.com
COURIER_SMTP_FROM_NAME=My Application
```

6. Generate domain for the Kratos service
7. Update `SERVE_PUBLIC_BASE_URL` with the generated domain

### Step 4: Deploy Frontend

1. Click "New" → "Empty Service"
2. Name it "frontend"
3. Connect your GitHub repository
4. Set the root directory to `/frontend`
5. Add environment variables:

```
NEXT_PUBLIC_KRATOS_PUBLIC_URL=https://kratos-production.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-frontend.up.railway.app
```

6. Generate domain for the frontend service
7. Update `NEXT_PUBLIC_APP_URL` and `SELFSERVICE_DEFAULT_BROWSER_RETURN_URL` in Kratos with this domain

### Step 5: Update CORS Settings

After deployment, update the Kratos environment variables:

```
SELFSERVICE_ALLOWED_RETURN_URLS=https://your-actual-frontend-domain.up.railway.app
```

Redeploy the Kratos service for changes to take effect.

## 🔐 Environment Variables Reference

### Backend (Kratos)

| Variable | Description | Example |
|----------|-------------|---------|
| `DSN` | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `SERVE_PUBLIC_BASE_URL` | Public API URL | `https://kratos.railway.app` |
| `SERVE_ADMIN_BASE_URL` | Admin API URL (internal) | `http://kratos:4434` |
| `SELFSERVICE_DEFAULT_BROWSER_RETURN_URL` | Frontend URL | `https://app.railway.app` |
| `SELFSERVICE_ALLOWED_RETURN_URLS` | Allowed redirect URLs | `https://app.railway.app` |
| `SECRETS_DEFAULT` | Secret key (min 32 chars) | `your-secret-key-min-32-chars` |
| `COURIER_SMTP_CONNECTION_URI` | SMTP server URI | `smtp://user:pass@smtp.mailtrap.io:2525` |
| `COURIER_SMTP_FROM_ADDRESS` | From email address | `noreply@example.com` |
| `COURIER_SMTP_FROM_NAME` | From name | `My Application` |

### Frontend

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_KRATOS_PUBLIC_URL` | Kratos public API URL | `https://kratos.railway.app` |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | `https://app.railway.app` |

## 📧 SMTP Configuration

### Development (Mailslurper)

Mailslurper is included in docker-compose for local testing:
- SMTP: `smtp://test:test@mailslurper:1025`
- Web UI: http://localhost:4436

### Testing (Mailtrap)

1. Sign up at https://mailtrap.io
2. Get SMTP credentials from inbox settings
3. Update environment variable:
```
COURIER_SMTP_CONNECTION_URI=smtp://username:password@smtp.mailtrap.io:2525
```

### Production (SendGrid, AWS SES, etc.)

For production, use a reliable email service:

**SendGrid**:
```
COURIER_SMTP_CONNECTION_URI=smtp://apikey:YOUR_API_KEY@smtp.sendgrid.net:587
```

**AWS SES**:
```
COURIER_SMTP_CONNECTION_URI=smtp://USERNAME:PASSWORD@email-smtp.us-east-1.amazonaws.com:587
```

## 🔧 Configuration Details

### Kratos Configuration (kratos.yml)

The Kratos configuration includes:
- **Self-service flows**: Login, registration, recovery, verification, settings
- **Authentication methods**: Password, TOTP, lookup secrets, email codes
- **CORS**: Configured for frontend communication
- **Session management**: Secure cookie-based sessions
- **Identity schema**: Email-based authentication with optional name fields

### Identity Schema

Located in `backend/identity.schema.json`, defines:
- Email (required, used for login)
- First name (optional)
- Last name (optional)

To customize, edit the schema and restart Kratos.

## 🧪 Testing the Setup

### Test Registration Flow

1. Navigate to `/registration`
2. Enter email and password
3. Check email for verification code
4. Enter code at `/verification`

### Test Login Flow

1. Navigate to `/login`
2. Enter credentials
3. Should redirect to `/settings` on success

### Test Recovery Flow

1. Navigate to `/recovery`
2. Enter email
3. Check email for recovery code
4. Enter code and set new password

### Test Settings Flow

1. Login first
2. Navigate to `/settings`
3. Update profile or password
4. Changes should be saved

## 🐛 Troubleshooting

### Kratos Migration Fails

```bash
# Check database connection
docker-compose logs postgres

# Manually run migrations
docker-compose run --rm kratos migrate sql -e --yes
```

### CORS Errors

Ensure `SELFSERVICE_ALLOWED_RETURN_URLS` in Kratos matches your frontend URL exactly.

### Email Not Sending

- Check SMTP credentials
- Verify SMTP port (usually 587 or 2525)
- Check Kratos logs: `docker-compose logs kratos`

### Frontend Can't Connect to Kratos

- Verify `NEXT_PUBLIC_KRATOS_PUBLIC_URL` is correct
- Check network connectivity between services
- Ensure Kratos is running: `docker-compose ps`

### Railway Deployment Issues

- Check build logs in Railway dashboard
- Verify all environment variables are set
- Ensure domains are generated for both services
- Check service logs for runtime errors

## 📚 Additional Resources

- [Ory Kratos Documentation](https://www.ory.com/docs/kratos)
- [Ory Kratos GitHub](https://github.com/ory/kratos)
- [Railway Documentation](https://docs.railway.app)
- [Next.js Documentation](https://nextjs.org/docs)

## 🔒 Security Considerations

1. **Secrets**: Always use strong, randomly generated secrets (min 32 characters)
2. **HTTPS**: Always use HTTPS in production (Railway provides this automatically)
3. **CORS**: Restrict `SELFSERVICE_ALLOWED_RETURN_URLS` to your actual domains
4. **Database**: Use Railway's PostgreSQL with strong passwords
5. **SMTP**: Use authenticated SMTP with TLS in production
6. **Rate Limiting**: Consider adding rate limiting for production use

## 📝 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

Contributions are welcome! Please ensure all changes are tested locally before submitting.

## 💬 Support

For issues related to:
- **Ory Kratos**: Check [Ory Kratos GitHub Issues](https://github.com/ory/kratos/issues)
- **Railway**: Check [Railway Discord](https://discord.gg/railway)
- **This Setup**: Open an issue in this repository
