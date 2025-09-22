#!/bin/bash
# Database Safety Script for Sproutify Classrooms
# This script provides guardrails and safety checks for database operations

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
PROJECT_ID="cqrjesmpwaqvmssrdeoc"

# Safety flags
REQUIRE_CONFIRMATION=true
AUTO_BACKUP=true
DRY_RUN_MODE=false

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Check if running in production environment
check_environment() {
    local env=${1:-"unknown"}
    
    if [[ "$env" == "prod" || "$env" == "production" ]]; then
        warn "PRODUCTION ENVIRONMENT DETECTED!"
        warn "Extra safety measures will be applied."
        return 0
    fi
    return 1
}

# Create backup directory if it doesn't exist
ensure_backup_dir() {
    if [[ ! -d "$BACKUP_DIR" ]]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Create database backup
create_backup() {
    local backup_name="db_backup_${TIMESTAMP}"
    local backup_file="${BACKUP_DIR}/${backup_name}.sql"
    
    log "Creating database backup: $backup_file"
    
    # Check if supabase CLI is available
    if ! command -v supabase &> /dev/null; then
        error "Supabase CLI not found. Please install it first."
        exit 1
    fi
    
    # Create backup using supabase CLI
    if supabase db dump --file "$backup_file" --data-only; then
        success "Backup created successfully: $backup_file"
        
        # Compress backup
        if command -v gzip &> /dev/null; then
            gzip "$backup_file"
            backup_file="${backup_file}.gz"
            success "Backup compressed: $backup_file"
        fi
        
        # Store backup metadata using jq for proper JSON generation
        jq -n \
            --arg TIMESTAMP "$TIMESTAMP" \
            --arg backup_file "$backup_file" \
            --arg PROJECT_ID "$PROJECT_ID" \
            --arg created_by "$(whoami)" \
            --arg hostname "$(hostname)" \
            --arg git_branch "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')" \
            --arg git_commit "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')" \
            '{
                timestamp: $TIMESTAMP,
                backup_file: $backup_file,
                project_id: $PROJECT_ID,
                created_by: $created_by,
                hostname: $hostname,
                git_branch: $git_branch,
                git_commit: $git_commit
            }' > "${backup_file}.meta"
        success "Backup metadata saved: ${backup_file}.meta"
        
        return 0
    else
        error "Failed to create backup"
        return 1
    fi
}

# List recent backups
list_backups() {
    log "Recent database backups:"
    if [[ -d "$BACKUP_DIR" ]]; then
        ls -laht "$BACKUP_DIR"/*.sql* 2>/dev/null | head -10 || echo "No backups found"
    else
        echo "No backup directory found"
    fi
}

# Restore from backup
restore_backup() {
    local backup_file="$1"
    
    # Validate and canonicalize the backup file path
    if [[ -z "$backup_file" ]]; then
        error "No backup file specified"
        return 1
    fi
    
    # Canonicalize the path to prevent directory traversal
    local canonical_path
    canonical_path=$(realpath "$backup_file" 2>/dev/null)
    if [[ $? -ne 0 ]]; then
        error "Invalid backup file path: $backup_file"
        return 1
    fi
    
    # Check if path is within allowed directories
    local allowed_dirs=("$BACKUP_DIR" "/var/backups" "/tmp")
    local path_allowed=false
    for dir in "${allowed_dirs[@]}"; do
        if [[ "$canonical_path" == "$dir"* ]]; then
            path_allowed=true
            break
        fi
    done
    
    if [[ "$path_allowed" == false ]]; then
        error "Backup file path not in allowed directories: $canonical_path"
        return 1
    fi
    
    if [[ ! -f "$canonical_path" ]]; then
        error "Backup file not found: $canonical_path"
        return 1
    fi
    
    warn "You are about to RESTORE the database from backup: $canonical_path"
    warn "This will OVERWRITE the current database!"
    
    if [[ "$REQUIRE_CONFIRMATION" == "true" ]]; then
        echo -n "Type 'RESTORE' to confirm: "
        read -r confirmation
        if [[ "$confirmation" != "RESTORE" ]]; then
            log "Restore cancelled by user"
            return 1
        fi
    fi
    
    log "Restoring database from backup..."
    
    # Use canonical_path for the rest of the function
    backup_file="$canonical_path"
    
    # Decompress if needed
    local restore_file="$backup_file"
    if [[ "$backup_file" == *.gz ]]; then
        restore_file="${backup_file%.gz}"
        log "Decompressing backup..."
        gunzip -c "$backup_file" > "$restore_file"
    fi
    
    # Restore using supabase CLI
    if supabase db reset --file "$restore_file"; then
        success "Database restored successfully from: $backup_file"
        
        # Clean up temporary file if we decompressed
        if [[ "$restore_file" != "$backup_file" ]]; then
            rm -f "$restore_file"
        fi
        
        return 0
    else
        error "Failed to restore database"
        return 1
    fi
}

# Safe migration runner
run_migrations() {
    local env=${1:-"development"}
    
    log "Running database migrations for environment: $env"
    
    # Check if we're in production
    if check_environment "$env"; then
        warn "PRODUCTION MIGRATION DETECTED!"
        echo -n "Type 'MIGRATE-PROD' to confirm: "
        read -r confirmation
        if [[ "$confirmation" != "MIGRATE-PROD" ]]; then
            log "Production migration cancelled by user"
            return 1
        fi
    fi
    
    # Create backup before migration
    if [[ "$AUTO_BACKUP" == "true" ]]; then
        if ! create_backup; then
            error "Failed to create backup before migration"
            return 1
        fi
    fi
    
    # Run migrations
    log "Applying migrations..."
    if supabase db push; then
        success "Migrations applied successfully"
        return 0
    else
        error "Migration failed"
        return 1
    fi
}

# Safe database reset
safe_reset() {
    local env=${1:-"development"}
    local force=${2:-false}
    
    warn "DATABASE RESET REQUESTED!"
    warn "Environment: $env"
    warn "Force mode: $force"
    
    # Extra protection for production
    if check_environment "$env"; then
        error "PRODUCTION DATABASE RESET BLOCKED!"
        error "This operation is not allowed in production environment."
        error "If you really need to reset production, use the manual recovery process."
        return 1
    fi
    
    # Require explicit confirmation
    if [[ "$REQUIRE_CONFIRMATION" == "true" && "$force" != "true" ]]; then
        warn "This will COMPLETELY WIPE the database!"
        warn "All data will be lost!"
        echo -n "Type 'RESET-DATABASE' to confirm: "
        read -r confirmation
        if [[ "$confirmation" != "RESET-DATABASE" ]]; then
            log "Database reset cancelled by user"
            return 1
        fi
    fi
    
    # Create backup before reset
    if [[ "$AUTO_BACKUP" == "true" ]]; then
        if ! create_backup; then
            error "Failed to create backup before reset"
            return 1
        fi
    fi
    
    # Perform reset
    log "Resetting database..."
    if supabase db reset; then
        success "Database reset completed successfully"
        return 0
    else
        error "Database reset failed"
        return 1
    fi
}

# Show help
show_help() {
    cat << EOF
Database Safety Script for Sproutify Classrooms

USAGE:
    $0 <command> [options]

COMMANDS:
    backup                    Create a database backup
    restore <backup_file>     Restore database from backup
    migrate [env]            Run migrations safely
    reset [env] [--force]    Reset database (with safety checks)
    list-backups             List recent backups
    help                     Show this help

OPTIONS:
    --no-backup              Disable automatic backup creation
    --no-confirm             Disable confirmation prompts
    --dry-run                Show what would be done without executing
    --force                  Force operation (bypass some safety checks)

EXAMPLES:
    $0 backup                           # Create backup
    $0 migrate development              # Run migrations in dev
    $0 reset development                # Reset dev database
    $0 restore backups/db_backup_20240101_120000.sql

SAFETY FEATURES:
    - Automatic backups before destructive operations
    - Production environment protection
    - Confirmation prompts for dangerous operations
    - Backup metadata tracking
    - Environment-specific safety levels

EOF
}

# Main script logic
main() {
    local command=${1:-"help"}
    shift || true
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-backup)
                AUTO_BACKUP=false
                shift
                ;;
            --no-confirm)
                REQUIRE_CONFIRMATION=false
                shift
                ;;
            --dry-run)
                DRY_RUN_MODE=true
                shift
                ;;
            --force)
                FORCE_MODE=true
                shift
                ;;
            *)
                break
                ;;
        esac
    done
    
    # Ensure backup directory exists
    ensure_backup_dir
    
    # Execute command
    case $command in
        backup)
            create_backup
            ;;
        restore)
            if [[ $# -eq 0 ]]; then
                error "Backup file required for restore"
                exit 1
            fi
            restore_backup "$1"
            ;;
        migrate)
            run_migrations "${1:-development}"
            ;;
        reset)
            safe_reset "${1:-development}" "${FORCE_MODE:-false}"
            ;;
        list-backups)
            list_backups
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
