# Database Raw Commands Reference

This document provides the raw Supabase CLI commands for database operations without the wrapper script abstraction.

## Important: Connection Pooler vs Direct Connections

**⚠️ Direct database connections are often blocked by Supabase for security reasons.**

When connecting to remote Supabase databases (production/CI), you must use the **Connection Pooler** instead of direct connections:

- ❌ **Direct**: `db.{PROJECT_REF}.supabase.co:5432` - Often blocked, IPv6 only
- ✅ **Pooler**: `aws-{N}-{REGION}.pooler.supabase.com:5432` - IPv4-compatible, works reliably

**Connection Pooler Modes:**

1. **Session Mode** (port `5432`) - Recommended for restores

   - Supports long-running transactions
   - Best for: backups, restores, migrations
   - Connection string format: `postgresql://postgres.{PROJECT_REF}:{PASSWORD}@aws-{N}-{REGION}.pooler.supabase.com:5432/postgres`

2. **Transaction Mode** (port `6543`) - For short queries only
   - Limited to single transactions
   - Best for: quick queries, connection pooling in apps
   - Not suitable for restores or long operations

## Database Project References

- **Production**: `mdyjiyyoidizsjdfyxdm`
  - Region: `eu-central-1`
  - Pooler: `aws-0-eu-central-1.pooler.supabase.com`
- **CI Test**: `rftqneipeoscundnthou`
  - Region: `eu-central-1`
  - Pooler: `aws-1-eu-central-1.pooler.supabase.com`
- **Local**: Uses local Supabase instance (`localhost:64322`)

## Prerequisites

```bash
# First time: Login to Supabase
supabase login

# For local: Start local Supabase
pnpm supabase start

# For remote: Link to project
supabase link --project-ref mdyjiyyoidizsjdfyxdm  # production
supabase link --project-ref rftqneipeoscundnthou  # ci
```

## Backup Database (Data Only)

### Local

```bash
# Create backup directory
mkdir -p backups

# Backup with timestamp
supabase db dump --local --data-only -f "backups/local_data_$(date +%Y%m%d_%H%M%S).sql"

# Optional: Add metadata to latest backup
BACKUP_FILE=$(ls -t backups/local_data_*.sql | head -1)
LATEST_MIGRATION=$(supabase migration list --local | grep -E '^\s+[0-9]{14}\s+\|' | tail -1 | awk '{print $1}' | tr -d '[:space:]')
TEMP_FILE="${BACKUP_FILE}.tmp"
{
  echo "-- Kalkul Database Backup"
  echo "-- Database: Local Development"
  echo "-- Latest Migration: ${LATEST_MIGRATION:-no_migrations}"
  echo "-- Created: $(date)"
  echo ""
  cat "$BACKUP_FILE"
} > "$TEMP_FILE"
mv "$TEMP_FILE" "$BACKUP_FILE"
```

### Production

```bash
# Link to production first
supabase link --project-ref mdyjiyyoidizsjdfyxdm

# Backup with timestamp
supabase db dump --linked --data-only -f "backups/prod_data_$(date +%Y%m%d_%H%M%S).sql"

# Optional: Add metadata to latest backup
BACKUP_FILE=$(ls -t backups/prod_data_*.sql | head -1)
LATEST_MIGRATION=$(supabase migration list --linked | grep -E '^\s+[0-9]{14}\s+\|\s+[0-9]{14}' | tail -1 | awk '{print $1}' | tr -d '[:space:]')
TEMP_FILE="${BACKUP_FILE}.tmp"
{
  echo "-- Kalkul Database Backup"
  echo "-- Database: Production (Kalkul) (mdyjiyyoidizsjdfyxdm)"
  echo "-- Latest Migration: ${LATEST_MIGRATION:-no_migrations}"
  echo "-- Created: $(date)"
  echo ""
  cat "$BACKUP_FILE"
} > "$TEMP_FILE"
mv "$TEMP_FILE" "$BACKUP_FILE"

echo "⚠️  WARNING: Data backup contains sensitive information!"
```

### CI Test

```bash
# Link to CI first
supabase link --project-ref rftqneipeoscundnthou

# Backup with timestamp
supabase db dump --linked --data-only -f "backups/ci_data_$(date +%Y%m%d_%H%M%S).sql"

# Optional: Add metadata to latest backup
BACKUP_FILE=$(ls -t backups/ci_data_*.sql | head -1)
LATEST_MIGRATION=$(supabase migration list --linked | grep -E '^\s+[0-9]{14}\s+\|\s+[0-9]{14}' | tail -1 | awk '{print $1}' | tr -d '[:space:]')
TEMP_FILE="${BACKUP_FILE}.tmp"
{
  echo "-- Kalkul Database Backup"
  echo "-- Database: CI Test (Kalkul CI test) (rftqneipeoscundnthou)"
  echo "-- Latest Migration: ${LATEST_MIGRATION:-no_migrations}"
  echo "-- Created: $(date)"
  echo ""
  cat "$BACKUP_FILE"
} > "$TEMP_FILE"
mv "$TEMP_FILE" "$BACKUP_FILE"

echo "⚠️  WARNING: Data backup contains sensitive information!"
```

## Restore Database

**⚠️ WARNING: This will overwrite all data in the target database!**

**Note:** The restore operation uses `supabase db reset` with the backup as a temporary seed file. This ensures the schema is recreated from migrations before loading the backup data, making restores more reliable.

### Local

```bash
# Backup original seed.sql if it exists
SEED_FILE="supabase/seed.sql"
SEED_BACKUP="supabase/seed.sql.restore-backup"

if [[ -f "$SEED_FILE" ]]; then
  mv "$SEED_FILE" "$SEED_BACKUP"
fi

# Use backup as temporary seed
cp backups/prod_data_20251119_120000.sql "$SEED_FILE"

# Reset database (drops, recreates, applies migrations, loads seed/backup)
supabase db reset

# Restore original seed.sql
if [[ -f "$SEED_BACKUP" ]]; then
  mv "$SEED_BACKUP" "$SEED_FILE"
else
  rm "$SEED_FILE"
fi

# Verify data counts
DB_URL=$(supabase status | grep "Database URL" | awk '{print $3}')
psql "$DB_URL" -t << 'EOF'
SELECT 'Clients: ' || COUNT(*) FROM public.client
UNION ALL SELECT 'Portfolios: ' || COUNT(*) FROM public.portfolio
UNION ALL SELECT 'Investments: ' || COUNT(*) FROM public.investment
UNION ALL SELECT 'Transactions: ' || COUNT(*) FROM public.transaction;
EOF

# Check schema integrity
supabase db lint
```

### Production

**⚠️ EXTREME CAUTION: This modifies production data!**

```bash
# Link to production
supabase link --project-ref mdyjiyyoidizsjdfyxdm

# Backup original seed.sql if it exists
SEED_FILE="supabase/seed.sql"
SEED_BACKUP="supabase/seed.sql.restore-backup"

if [[ -f "$SEED_FILE" ]]; then
  mv "$SEED_FILE" "$SEED_BACKUP"
fi

# Use backup as temporary seed
cp backups/prod_data_20251119_120000.sql "$SEED_FILE"

# Reset database (drops, recreates, applies migrations, loads seed/backup)
# This will log out all users!
supabase db reset --linked

# Restore original seed.sql
if [[ -f "$SEED_BACKUP" ]]; then
  mv "$SEED_BACKUP" "$SEED_FILE"
else
  rm "$SEED_FILE"
fi

# Verify schema
supabase db lint --linked
```

### CI Test

```bash
# Link to CI
supabase link --project-ref rftqneipeoscundnthou

# Backup original seed.sql if it exists
SEED_FILE="supabase/seed.sql"
SEED_BACKUP="supabase/seed.sql.restore-backup"

if [[ -f "$SEED_FILE" ]]; then
  mv "$SEED_FILE" "$SEED_BACKUP"
fi

# Use backup as temporary seed
cp backups/ci_data_20251119_120000.sql "$SEED_FILE"

# Reset database (drops, recreates, applies migrations, loads seed/backup)
supabase db reset --linked

# Restore original seed.sql
if [[ -f "$SEED_BACKUP" ]]; then
  mv "$SEED_BACKUP" "$SEED_FILE"
else
  rm "$SEED_FILE"
fi

# Verify schema
supabase db lint --linked
```

## Apply Migrations (Preserves Data)

### Local

```bash
# Check pending migrations
supabase migration list

# Apply all pending migrations
supabase migration up

# Verify schema
supabase db lint
```

### Production

**⚠️ Always backup first!**

```bash
# Link to production
supabase link --project-ref mdyjiyyoidizsjdfyxdm

# Check current migrations
supabase migration list --linked

# Push migrations to production
supabase db push --linked

# Verify schema
supabase db lint --linked
```

### CI Test

```bash
# Link to CI
supabase link --project-ref rftqneipeoscundnthou

# Check current migrations
supabase migration list --linked

# Push migrations
supabase db push --linked

# Verify schema
supabase db lint --linked
```

## Reset Database (⚠️ DESTROYS ALL DATA)

### Local

```bash
# Drop and recreate database, apply all migrations, skip seed
supabase db reset --no-seed

# Verify schema
supabase db lint
```

### Production

**⚠️ EXTREME DANGER: This destroys ALL production data!**

```bash
# Link to production
supabase link --project-ref mdyjiyyoidizsjdfyxdm

# Drop and recreate database
supabase db reset --linked --no-seed

# Verify schema
supabase db lint --linked
```

### CI Test

```bash
# Link to CI
supabase link --project-ref rftqneipeoscundnthou

# Drop and recreate database
supabase db reset --linked --no-seed

# Verify schema
supabase db lint --linked
```

## Complete Workflow Example: Production Migration

```bash
# 1. Backup production
supabase link --project-ref mdyjiyyoidizsjdfyxdm
mkdir -p backups
supabase db dump --linked --data-only -f "backups/prod_data_$(date +%Y%m%d_%H%M%S).sql"

# 2. Test migrations locally with production data
git checkout main

# Backup original seed.sql if it exists
SEED_FILE="supabase/seed.sql"
SEED_BACKUP="supabase/seed.sql.restore-backup"

if [[ -f "$SEED_FILE" ]]; then
  mv "$SEED_FILE" "$SEED_BACKUP"
fi

# Use production backup as temporary seed
cp backups/prod_data_20251119_120000.sql "$SEED_FILE"

# Reset local database with production data
supabase db reset

# Restore original seed.sql
if [[ -f "$SEED_BACKUP" ]]; then
  mv "$SEED_BACKUP" "$SEED_FILE"
else
  rm "$SEED_FILE"
fi

# Switch to migration branch and apply
git checkout <migration-branch>
supabase migration up

# Verify
pnpm check:all
pnpm test

# 3. Apply to production
supabase link --project-ref mdyjiyyoidizsjdfyxdm
supabase db push --linked
supabase db lint --linked
```

## Tips

- Use `--debug` flag for verbose output: `supabase db dump --debug --linked ...`
- Always backup before migrations or resets
- Test migrations locally with production data first
- Keep backups for at least 30 days
- Store production backups securely (they contain sensitive data)
