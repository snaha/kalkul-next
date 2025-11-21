#!/bin/bash
set -e

# Database wrapper script for easy access to prod/ci/local databases
# Usage: bash scripts/db-wrapper.sh <action> <db-alias> [--verbose|-v] [args...]

# Parse arguments and extract verbose flag
VERBOSE=""
DEBUG_FLAG=""
ARGS=()

for arg in "$@"; do
  if [[ "$arg" == "--verbose" ]] || [[ "$arg" == "-v" ]]; then
    VERBOSE="1"
    DEBUG_FLAG="--debug"
  else
    ARGS+=("$arg")
  fi
done

# Show verbose mode message
if [[ "$VERBOSE" == "1" ]]; then
  echo "🔍 Verbose mode enabled (supabase --debug)"
fi

# Extract action and db_alias from cleaned args
ACTION="${ARGS[0]}"
DB_ALIAS="${ARGS[1]}"

# Database configurations
PROD_PROJECT_REF="mdyjiyyoidizsjdfyxdm"
PROD_DB_NAME="Production (Kalkul)"
PROD_POOLER_REGION="eu-central-1"  # aws-0-eu-central-1

CI_PROJECT_REF="rftqneipeoscundnthou"
CI_DB_NAME="CI Test (Kalkul CI test)"
CI_POOLER_REGION="eu-central-1"  # aws-1-eu-central-1

LOCAL_PROJECT_REF="local"
LOCAL_DB_NAME="Local Development"

# Retry configuration
# Note: Reduced retries to avoid triggering Supabase network bans
# See README.md "Troubleshooting Database Operations" for details
MAX_RETRIES=2
RETRY_DELAY=3

# Delay between Supabase API calls to avoid rate limiting (in seconds)
API_DELAY=1

# Helper functions
get_db_ref() {
  case "$1" in
    prod|production) echo "$PROD_PROJECT_REF" ;;
    ci|test) echo "$CI_PROJECT_REF" ;;
    local|dev) echo "$LOCAL_PROJECT_REF" ;;
    *)
      echo "❌ Error: Unknown database alias '$1'" >&2
      echo "" >&2
      echo "Available: prod, ci, local" >&2
      exit 1
      ;;
  esac
}

get_db_name() {
  case "$1" in
    prod|production) echo "$PROD_DB_NAME" ;;
    ci|test) echo "$CI_DB_NAME" ;;
    local|dev) echo "$LOCAL_DB_NAME" ;;
    *) echo "unknown" ;;
  esac
}

get_pooler_region() {
  case "$1" in
    prod|production) echo "$PROD_POOLER_REGION" ;;
    ci|test) echo "$CI_POOLER_REGION" ;;
    *) echo "" ;;
  esac
}

is_local() {
  [[ "$1" == "local" ]] || [[ "$1" == "dev" ]]
}

# Check for network bans (only called when retries fail)
check_network_bans() {
  local project_ref="$1"

  # Only check for remote databases
  if [[ "$project_ref" == "local" ]]; then
    return 0
  fi

  echo ""
  echo "🔍 Checking for network bans..."

  # Get network bans (suppress errors if command fails)
  local bans_output
  bans_output=$(supabase network-bans get --project-ref "$project_ref" 2>&1 || true)

  # Check if we got banned IPs in the output
  if echo "$bans_output" | grep -qE "([0-9]{1,3}\.){3}[0-9]{1,3}"; then
    echo "❌ Your IP is currently banned on Supabase!"
    echo ""
    echo "$bans_output"
    echo ""
    echo "To unban your IP, run:"
    echo "  supabase network-bans get --project-ref $project_ref"
    echo "  supabase network-bans remove --project-ref $project_ref <banned-ip>"
    echo ""
    return 1
  else
    echo "   ✓ No network bans detected"
    echo "   The failure was likely due to network issues or invalid credentials"
    return 0
  fi
}

# Retry wrapper for commands
retry_command() {
  local attempt=1
  local max_attempts=$1
  local delay=$2
  shift 2
  local cmd=("$@")

  while [ $attempt -le $max_attempts ]; do
    if [ $attempt -gt 1 ]; then
      echo "  ↻ Retry attempt $attempt/$max_attempts..."
      sleep $delay
    fi

    if [[ "$VERBOSE" == "1" ]]; then
      # In verbose mode, show all output
      if "${cmd[@]}"; then
        # Add delay after successful API calls to avoid rate limiting
        sleep $API_DELAY
        return 0
      fi
    else
      # In normal mode, suppress output
      if "${cmd[@]}" > /dev/null 2>&1; then
        # Add delay after successful API calls to avoid rate limiting
        sleep $API_DELAY
        return 0
      fi
    fi

    attempt=$((attempt + 1))
  done

  return 1
}

# Get migration list with retry and validation
get_migration_list() {
  local db_alias="$1"
  local attempt=1

  while [ $attempt -le $MAX_RETRIES ]; do
    if [ $attempt -gt 1 ]; then
      echo "  ↻ Retry fetching migrations (attempt $attempt/$MAX_RETRIES)..."
      sleep $RETRY_DELAY
    fi

    local migration_output
    if is_local "$db_alias"; then
      migration_output=$(supabase migration list --local $DEBUG_FLAG 2>&1)
    else
      migration_output=$(supabase migration list --linked $DEBUG_FLAG 2>&1)
    fi

    local exit_code=$?

    # Check for success
    if [ $exit_code -eq 0 ]; then
      # Validate output has expected format (should contain header or migrations)
      if echo "$migration_output" | grep -qE '(timestamp|[0-9]{14})'; then
        # Add delay after successful API calls to avoid rate limiting
        sleep $API_DELAY
        echo "$migration_output"
        return 0
      else
        echo "⚠️  Warning: Migration list output doesn't contain expected format" >&2
      fi
    fi

    attempt=$((attempt + 1))
  done

  echo "❌ Error: Failed to fetch migration list after $MAX_RETRIES attempts" >&2

  # Check for network bans on remote databases
  if ! is_local "$db_alias"; then
    local project_ref=$(get_db_ref "$db_alias")
    check_network_bans "$project_ref"
  fi

  return 1
}

# Extract latest migration from migration list with validation
get_latest_migration() {
  local db_alias="$1"
  local migration_list="$2"

  local latest_migration
  if is_local "$db_alias"; then
    # For local: any line with a Local timestamp means it's applied
    latest_migration=$(echo "$migration_list" | grep -E '^\s+[0-9]{14}\s+\|' | tail -1 | awk '{print $1}')
  else
    # For remote: only lines with both Local AND Remote timestamps are applied
    latest_migration=$(echo "$migration_list" | grep -E '^\s+[0-9]{14}\s+\|\s+[0-9]{14}' | tail -1 | awk '{print $1}')
  fi

  # Trim whitespace
  latest_migration=$(echo "$latest_migration" | tr -d '[:space:]')

  # Validate migration ID format (14 digits)
  if [[ -n "$latest_migration" ]]; then
    if ! echo "$latest_migration" | grep -qE '^[0-9]{14}$'; then
      echo "❌ Error: Invalid migration ID format: '$latest_migration'" >&2
      return 1
    fi
  fi

  # Default to "no_migrations" if empty
  if [[ -z "$latest_migration" ]]; then
    latest_migration="no_migrations"
  fi

  echo "$latest_migration"
  return 0
}

# Get project ref and name for the alias
PROJECT_REF=$(get_db_ref "$DB_ALIAS")
DB_NAME=$(get_db_name "$DB_ALIAS")

# Link to the project for this operation (skip for local)
if ! is_local "$DB_ALIAS"; then
  echo "🔗 Linking to $DB_NAME..."

  if [[ "$VERBOSE" == "1" ]]; then
    if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase link $DEBUG_FLAG --project-ref "$PROJECT_REF"; then
      echo "❌ Error: Failed to link to database after $MAX_RETRIES attempts"
      check_network_bans "$PROJECT_REF"
      exit 1
    fi
  else
    if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase link --project-ref "$PROJECT_REF" > /dev/null 2>&1; then
      echo "❌ Error: Failed to link to database after $MAX_RETRIES attempts"
      check_network_bans "$PROJECT_REF"
      exit 1
    fi
  fi

  # Add delay after linking
  sleep $API_DELAY

  echo "   ✓ Linked"
  echo ""
fi

# Get database URL (local only - remote uses different method)
if is_local "$DB_ALIAS"; then
  DB_URL=$(supabase status 2>&1 | grep "Database URL" | awk '{print $3}')
  if [[ -z "$DB_URL" ]]; then
    echo "❌ Error: Local Supabase is not running. Start it with: pnpm supabase start"
    exit 1
  fi
fi

case "$ACTION" in
  backup)
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="backups"
    mkdir -p "$BACKUP_DIR"

    echo "📦 Backing up $DB_NAME..."

    # Get migration list with retry
    echo "  → Fetching migration info..."
    MIGRATION_LIST=$(get_migration_list "$DB_ALIAS")
    if [ $? -ne 0 ]; then
      echo "❌ Error: Cannot proceed with backup - failed to fetch migration list"
      exit 1
    fi

    # Extract latest migration with validation
    LATEST_MIGRATION=$(get_latest_migration "$DB_ALIAS" "$MIGRATION_LIST")
    if [ $? -ne 0 ]; then
      echo "❌ Error: Cannot proceed with backup - invalid migration data"
      exit 1
    fi

    BACKUP_FILE="${BACKUP_DIR}/${DB_ALIAS}_data_${TIMESTAMP}.sql"

    echo "  → Latest migration: $LATEST_MIGRATION"
    echo "  → Backing up data..."

    # Backup with retry
    if is_local "$DB_ALIAS"; then
      if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase db dump $DEBUG_FLAG --local --data-only -f "$BACKUP_FILE"; then
        echo "❌ Error: Failed to backup database after $MAX_RETRIES attempts"
        rm -f "$BACKUP_FILE"  # Clean up partial backup
        exit 1
      fi
    else
      if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase db dump $DEBUG_FLAG --linked --data-only -f "$BACKUP_FILE"; then
        echo "❌ Error: Failed to backup database after $MAX_RETRIES attempts"
        check_network_bans "$PROJECT_REF"
        rm -f "$BACKUP_FILE"  # Clean up partial backup
        exit 1
      fi
    fi

    # Validate backup file was created and has content
    if [[ ! -f "$BACKUP_FILE" ]]; then
      echo "❌ Error: Backup file was not created"
      exit 1
    fi

    if [[ ! -s "$BACKUP_FILE" ]]; then
      echo "❌ Error: Backup file is empty"
      rm -f "$BACKUP_FILE"
      exit 1
    fi

    # Validate backup has expected SQL structure (either COPY or INSERT statements)
    if ! grep -qE "(^COPY |^INSERT INTO )" "$BACKUP_FILE" 2>/dev/null; then
      echo "⚠️  Warning: Backup file doesn't contain expected COPY or INSERT statements"
      echo "   The backup may be incomplete or corrupted"
      read -p "   Keep this backup anyway? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        rm -f "$BACKUP_FILE"
        echo "❌ Backup cancelled"
        exit 1
      fi
    fi

    # Add migration info as comment at the top of the backup file
    TEMP_FILE="${BACKUP_FILE}.tmp"
    {
      echo "-- Kalkul Database Backup"
      echo "-- Database: $DB_NAME ($PROJECT_REF)"
      echo "-- Timestamp: $TIMESTAMP"
      echo "-- Latest Migration: $LATEST_MIGRATION"
      echo "-- Created: $(date)"
      echo ""
      cat "$BACKUP_FILE"
    } > "$TEMP_FILE"
    mv "$TEMP_FILE" "$BACKUP_FILE"

    echo "  ✓ Data: $BACKUP_FILE"

    echo ""
    if ! is_local "$DB_ALIAS"; then
      echo "⚠️  WARNING: Data backup contains sensitive information!"
    fi
    echo "✅ Backup complete!"
    ;;

  restore)
    BACKUP_FILE="${ARGS[2]}"
    if [[ -z "$BACKUP_FILE" ]]; then
      echo "❌ Error: Missing backup file"
      echo "Usage: pnpm db restore $DB_ALIAS <backup-file>"
      exit 1
    fi

    if [[ ! -f "$BACKUP_FILE" ]]; then
      echo "❌ Error: Backup file not found: $BACKUP_FILE"
      exit 1
    fi

    # Extract migration info from backup file if available
    BACKUP_MIGRATION=$(grep "^-- Latest Migration:" "$BACKUP_FILE" 2>/dev/null | cut -d':' -f2 | xargs || echo "unknown")
    BACKUP_DATE=$(grep "^-- Created:" "$BACKUP_FILE" 2>/dev/null | cut -d':' -f2- | xargs || echo "unknown")

    if is_local "$DB_ALIAS"; then
      echo "🔄 Restoring to $DB_NAME..."
      echo "   Source: $BACKUP_FILE"
      if [[ "$BACKUP_MIGRATION" != "unknown" ]]; then
        echo "   Backup migration: $BACKUP_MIGRATION"
        echo "   Backup created: $BACKUP_DATE"
      fi
      echo ""
      echo "This will:"
      echo "  - Drop and recreate database"
      echo "  - Apply all migrations"
      echo "  - Load backup data"
      echo "  - ⚠️  ALL CURRENT DATA WILL BE LOST"
      echo ""

      read -p "Continue? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
      fi
    else
      echo "⚠️ ⚠️ ⚠️  DANGER: REMOTE DATABASE RESTORE  ⚠️ ⚠️ ⚠️"
      echo ""
      echo "   Project: $PROJECT_REF"
      echo "   Source: $BACKUP_FILE"
      if [[ "$BACKUP_MIGRATION" != "unknown" ]]; then
        echo "   Backup migration: $BACKUP_MIGRATION"
        echo "   Backup created: $BACKUP_DATE"
      fi
      echo ""
      echo "This will:"
      echo "  - Drop and recreate remote database"
      echo "  - Apply all migrations"
      echo "  - Load backup data"
      echo "  - LOG OUT ALL USERS"
      echo "  - ⚠️  ALL PRODUCTION DATA WILL BE LOST"
      echo ""

      read -p "Type '$PROJECT_REF' to confirm: " CONFIRMATION

      if [[ "$CONFIRMATION" != "$PROJECT_REF" ]]; then
        echo "❌ Cancelled"
        exit 1
      fi
    fi

    # Setup cleanup trap to restore original seed.sql even on failure
    SEED_FILE="supabase/seed.sql"
    SEED_BACKUP="supabase/seed.sql.restore-backup"

    cleanup_seed() {
      if [[ -f "$SEED_BACKUP" ]]; then
        mv "$SEED_BACKUP" "$SEED_FILE"
      elif [[ -f "$SEED_FILE" ]]; then
        rm "$SEED_FILE"
      fi
    }
    trap cleanup_seed EXIT INT TERM

    echo ""
    echo "1️⃣  Preparing seed file..."

    # Backup original seed.sql if it exists
    if [[ -f "$SEED_FILE" ]]; then
      mv "$SEED_FILE" "$SEED_BACKUP"
      echo "   → Backed up original seed.sql"
    fi

    # Copy backup file to seed.sql
    cp "$BACKUP_FILE" "$SEED_FILE"
    echo "   → Using backup as temporary seed"

    echo "2️⃣  Resetting database with backup data..."
    if is_local "$DB_ALIAS"; then
      supabase db reset $DEBUG_FLAG
    else
      supabase db reset $DEBUG_FLAG --linked
    fi

    echo ""
    echo "3️⃣  Cleaning up..."
    # Restore original seed.sql (or remove temporary one)
    cleanup_seed
    trap - EXIT INT TERM
    echo "   ✓ Restored original seed.sql"

    echo ""
    echo "✅ Restore complete!"
    ;;

  reset)
    echo "🔄 Resetting $DB_NAME..."
    echo ""
    echo "This will:"
    echo "  - Drop and recreate database"
    echo "  - Apply all migrations"
    echo "  - Skip seed data"
    echo "  - ⚠️  ALL DATA WILL BE LOST"
    echo ""

    if is_local "$DB_ALIAS"; then
      read -p "Continue? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
      fi
    else
      echo "⚠️  This is a REMOTE database. ALL PRODUCTION DATA WILL BE LOST!"
      echo ""
      read -p "Type '$PROJECT_REF' to confirm: " CONFIRMATION

      if [[ "$CONFIRMATION" != "$PROJECT_REF" ]]; then
        echo "❌ Cancelled"
        exit 1
      fi
    fi

    echo ""
    echo "1️⃣  Resetting database..."
    if is_local "$DB_ALIAS"; then
      supabase db reset $DEBUG_FLAG --no-seed
    else
      supabase db reset $DEBUG_FLAG --linked --no-seed
    fi

    echo ""
    echo "2️⃣  Verifying schema..."
    if is_local "$DB_ALIAS"; then
      if ! supabase db lint $DEBUG_FLAG; then
        echo "⚠️  Schema validation warnings (non-fatal)"
      fi
    else
      if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase db lint $DEBUG_FLAG --linked; then
        echo "⚠️  Schema validation failed"
        check_network_bans "$PROJECT_REF"
      fi
    fi

    echo ""
    echo "✅ Reset complete!"
    ;;

  migrate)
    if is_local "$DB_ALIAS"; then
      echo "📤 Applying migrations to $DB_NAME..."
      echo ""

      # Get list of migrations with retry
      MIGRATIONS=$(get_migration_list "$DB_ALIAS")
      if [ $? -ne 0 ]; then
        echo "❌ Error: Cannot proceed with migration - failed to fetch migration list"
        # Network ban check already done in get_migration_list if it failed
        exit 1
      fi

      # Show pending migrations (migrations with empty Remote column)
      # Pattern: "   20251112103423 |                | 2025-11-12 10:34:23"
      PENDING=$(echo "$MIGRATIONS" | grep -E '^\s+[0-9]{14}\s+\|\s+\|\s+' || echo "")

      # Applied migrations have both Local and Remote timestamps
      APPLIED=$(echo "$MIGRATIONS" | grep -E '^\s+[0-9]{14}\s+\|\s+[0-9]{14}\s+\|' || echo "")

      if [[ -n "$APPLIED" ]]; then
        APPLIED_COUNT=$(echo "$APPLIED" | wc -l | tr -d ' ')
        echo "✅ Already applied: $APPLIED_COUNT migrations"
        echo ""
      fi

      if [[ -z "$PENDING" ]]; then
        echo "✅ No pending migrations to apply"
        exit 0
      fi

      PENDING_COUNT=$(echo "$PENDING" | wc -l | tr -d ' ')
      echo "📋 Pending migrations to apply ($PENDING_COUNT):"
      echo ""
      # Extract migration IDs and get their names from files
      echo "$PENDING" | while read -r line; do
        MIGRATION_ID=$(echo "$line" | awk -F'|' '{print $1}' | xargs)
        TIMESTAMP=$(echo "$line" | awk -F'|' '{print $3}' | xargs)
        # Find the migration file and extract the name
        MIGRATION_FILE=$(ls supabase/migrations/ | grep "^${MIGRATION_ID}_" 2>/dev/null || echo "")
        if [[ -n "$MIGRATION_FILE" ]]; then
          MIGRATION_NAME=$(echo "$MIGRATION_FILE" | sed "s/^${MIGRATION_ID}_//" | sed 's/.sql$//')
          echo "  • $MIGRATION_ID: $MIGRATION_NAME ($TIMESTAMP)"
        else
          echo "  • $MIGRATION_ID ($TIMESTAMP)"
        fi
      done
      echo ""

      echo "This will apply the above migrations to local database"
      echo ""

      read -p "Continue? (y/N) " -n 1 -r
      echo
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled"
        exit 1
      fi

      echo ""
      echo "1️⃣  Applying migrations..."
      supabase migration up $DEBUG_FLAG

      echo ""
      echo "2️⃣  Verifying schema..."
      if ! supabase db lint $DEBUG_FLAG; then
        echo "⚠️  Schema validation warnings (non-fatal)"
      fi

      echo ""
      echo "✅ Migrations applied!"
    else
      echo "📤 Pushing migrations to $DB_NAME..."
      echo ""
      echo "⚠️  Before proceeding, ensure:"
      echo "  ✓ Backed up database (pnpm db backup $DB_ALIAS)"
      echo "  ✓ Tested migrations locally"
      echo "  ✓ Run all checks (pnpm check:all)"
      echo ""

      # Push migrations (this will show interactive prompt from supabase)
      if ! supabase db push $DEBUG_FLAG --linked; then
        echo ""
        echo "❌ Error: Failed to push migrations after $MAX_RETRIES attempts"
        echo ""
        echo "This is likely due to SSL connection requirements with the pooler."
        echo ""
        echo "Alternative: Use Supabase Dashboard"
        echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/database/migrations"
        echo "  2. Review and apply pending migrations manually"
        echo ""
        check_network_bans "$PROJECT_REF"
        exit 1
      fi

      echo ""
      echo "✅ Verifying schema..."
      if ! retry_command $MAX_RETRIES $RETRY_DELAY supabase db lint $DEBUG_FLAG --linked; then
        echo "⚠️  Schema validation failed"
        check_network_bans "$PROJECT_REF"
      fi

      echo ""
      echo "✅ Migrations applied!"
    fi
    ;;

  *)
    echo "❌ Error: Unknown action '$ACTION'"
    echo ""
    echo "Usage: pnpm db <action> <db-alias> [--verbose|-v] [args...]"
    echo ""
    echo "Actions:"
    echo "  backup  - Backup database (data only)"
    echo "  restore - Restore database from backup"
    echo "  reset   - Drop and recreate database (⚠️  destroys all data)"
    echo "  migrate - Apply pending migrations (preserves data)"
    echo ""
    echo "Database aliases:"
    echo "  prod, production - Production database (mdyjiyyoidizsjdfyxdm)"
    echo "  ci, test         - CI test database (rftqneipeoscundnthou)"
    echo "  local, dev       - Local development database"
    echo ""
    echo "Flags:"
    echo "  --verbose, -v    - Enable debug mode (adds --debug to supabase commands)"
    echo ""
    echo "Examples:"
    echo "  pnpm db backup prod"
    echo "  pnpm db backup prod --verbose"
    echo "  pnpm db migrate local -v"
    echo "  pnpm db migrate prod"
    echo "  pnpm db reset local"
    echo "  pnpm db restore local backups/prod_data_20251119_120000.sql"
    exit 1
    ;;
esac
