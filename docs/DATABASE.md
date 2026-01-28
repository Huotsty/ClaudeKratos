# PostgreSQL Configuration for Railway

Railway automatically provides PostgreSQL. Here's how to connect and manage it.

## Connection Details

Railway provides these environment variables automatically:
- `DATABASE_URL`: Full connection string
- `PGHOST`: Database host
- `PGPORT`: Database port (usually 5432)
- `PGUSER`: Database user
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name

## Using DATABASE_URL in Kratos

In your Kratos service, set the `DSN` variable to:
```
${{Postgres.DATABASE_URL}}
```

Railway will automatically inject the PostgreSQL connection string.

## Database Migrations

Kratos automatically runs migrations on startup using:
```bash
kratos migrate sql -e --yes
```

This is configured in the Kratos Dockerfile's CMD.

## Manual Database Access

### Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to your project
railway link

# Access PostgreSQL shell
railway run psql $DATABASE_URL
```

### Using psql Locally

1. Get connection details from Railway dashboard
2. Connect using:
```bash
psql "postgres://user:password@host:port/database?sslmode=require"
```

## Common SQL Queries

### View all identities
```sql
SELECT id, schema_id, traits, created_at, updated_at 
FROM identities;
```

### View identity traits (email, name)
```sql
SELECT id, traits->>'email' as email, traits->>'name' as name 
FROM identities;
```

### Count total users
```sql
SELECT COUNT(*) FROM identities;
```

### View recent registrations
```sql
SELECT id, traits->>'email' as email, created_at 
FROM identities 
ORDER BY created_at DESC 
LIMIT 10;
```

### Delete a specific identity
```sql
DELETE FROM identities WHERE id = 'identity-uuid-here';
```

### View all sessions
```sql
SELECT id, identity_id, active, expires_at, created_at 
FROM sessions 
WHERE active = true;
```

## Backup and Restore

### Backup Database

```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Or using connection string
pg_dump "postgres://user:pass@host:port/db" > backup.sql
```

### Restore Database

```bash
# Using Railway CLI
railway run psql $DATABASE_URL < backup.sql

# Or using connection string
psql "postgres://user:pass@host:port/db" < backup.sql
```

## Database Management Tools

### pgAdmin
1. Download from https://www.pgadmin.org
2. Add new server with Railway connection details
3. Use SSL mode: "Require"

### DBeaver
1. Download from https://dbeaver.io
2. Create new PostgreSQL connection
3. Use connection details from Railway

### TablePlus
1. Download from https://tableplus.com
2. Create new PostgreSQL connection
3. Import connection URL from Railway

## Monitoring

### Railway Dashboard
- View connection count
- Monitor query performance
- Check storage usage

### Query Monitoring
```sql
-- Active queries
SELECT pid, usename, application_name, state, query 
FROM pg_stat_activity 
WHERE state != 'idle';

-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Troubleshooting

### Connection Timeout
- Check if Railway PostgreSQL is running
- Verify DATABASE_URL is correct
- Ensure SSL mode is set correctly

### Migration Failed
```bash
# Check Kratos logs
railway logs --service kratos-backend

# Manually run migrations
railway run --service kratos-backend kratos migrate sql -e --yes
```

### Too Many Connections
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- View connection limit
SELECT setting FROM pg_settings WHERE name = 'max_connections';
```

## Security Best Practices

1. **Never commit connection strings**: Use environment variables
2. **Use SSL**: Always use `sslmode=require` in production
3. **Regular backups**: Schedule automated backups
4. **Monitor access**: Review pg_stat_activity regularly
5. **Strong passwords**: Railway generates these automatically
6. **Least privilege**: Use separate users for different services

## Performance Optimization

### Add Indexes
```sql
-- Index on email for faster lookups
CREATE INDEX idx_identities_email ON identities ((traits->>'email'));

-- Index on created_at for faster time-based queries
CREATE INDEX idx_identities_created_at ON identities (created_at);

-- Index on sessions for active session queries
CREATE INDEX idx_sessions_active ON sessions (active, expires_at);
```

### Analyze Tables
```sql
ANALYZE identities;
ANALYZE sessions;
```

### Vacuum Database
```sql
VACUUM ANALYZE;
```

## Scaling

Railway PostgreSQL auto-scales based on your plan:
- **Hobby**: Up to 1GB storage
- **Pro**: Configurable storage and resources

To upgrade:
1. Go to Railway dashboard
2. Select your PostgreSQL service
3. Click "Settings" → "Plan"
4. Choose appropriate plan

## Support

For PostgreSQL issues:
- Railway Discord: https://discord.gg/railway
- PostgreSQL Docs: https://www.postgresql.org/docs
- Ory Community: https://slack.ory.sh
