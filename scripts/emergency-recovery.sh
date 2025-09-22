#!/bin/bash
# Emergency Database Recovery Script
# Use this script only when normal recovery procedures fail

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
PROJECT_ID="cqrjesmpwaqvmssrdeoc"
EMERGENCY_LOG="./emergency_recovery.log"

# Logging function
log() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${BLUE}[$timestamp]${NC} $message" | tee -a "$EMERGENCY_LOG"
}

warn() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${YELLOW}[$timestamp] WARNING: $message${NC}" | tee -a "$EMERGENCY_LOG"
}

error() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${RED}[$timestamp] ERROR: $message${NC}" | tee -a "$EMERGENCY_LOG"
}

success() {
    local message="$1"
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    echo -e "${GREEN}[$timestamp] SUCCESS: $message${NC}" | tee -a "$EMERGENCY_LOG"
}

# Emergency recovery procedures
emergency_recovery() {
    log "🚨 EMERGENCY DATABASE RECOVERY INITIATED"
    log "Project ID: $PROJECT_ID"
    log "User: $(whoami)"
    log "Hostname: $(hostname)"
    log "Timestamp: $(date)"
    
    # Check available backups
    log "Checking available backups..."
    if [[ ! -d "$BACKUP_DIR" ]]; then
        error "Backup directory not found: $BACKUP_DIR"
        return 1
    fi
    
    local backups=($(ls -t "$BACKUP_DIR"/*.sql* 2>/dev/null || true))
    if [[ ${#backups[@]} -eq 0 ]]; then
        error "No backup files found in $BACKUP_DIR"
        return 1
    fi
    
    log "Found ${#backups[@]} backup files:"
    for i in "${!backups[@]}"; do
        local backup="${backups[$i]}"
        local size=$(du -h "$backup" | cut -f1)
        local date=$(stat -c %y "$backup" 2>/dev/null || stat -f %Sm "$backup" 2>/dev/null)
        log "  [$i] $(basename "$backup") ($size) - $date"
    done
    
    # Select backup
    echo -n "Enter backup number to restore (0-$((${#backups[@]}-1))): "
    read -r backup_index
    
    if [[ ! "$backup_index" =~ ^[0-9]+$ ]] || [[ "$backup_index" -ge ${#backups[@]} ]]; then
        error "Invalid backup selection"
        return 1
    fi
    
    local selected_backup="${backups[$backup_index]}"
    log "Selected backup: $selected_backup"
    
    # Final confirmation
    warn "⚠️  EMERGENCY RECOVERY WILL OVERWRITE CURRENT DATABASE"
    warn "⚠️  ALL CURRENT DATA WILL BE LOST"
    warn "⚠️  THIS CANNOT BE UNDONE"
    echo -n "Type 'EMERGENCY-RECOVER' to confirm: "
    read -r confirmation
    
    if [[ "$confirmation" != "EMERGENCY-RECOVER" ]]; then
        log "Emergency recovery cancelled by user"
        return 1
    fi
    
    # Perform recovery
    log "Starting emergency recovery..."
    
    # Decompress if needed
    local restore_file="$selected_backup"
    if [[ "$selected_backup" == *.gz ]]; then
        restore_file="${selected_backup%.gz}"
        log "Decompressing backup..."
        
        # Create temporary file for decompression
        local temp_file=$(mktemp)
        
        # Decompress with error checking
        if ! gunzip -c "$selected_backup" > "$temp_file"; then
            error "Failed to decompress backup file"
            rm -f "$temp_file"
            return 1
        fi
        
        # Move temp file to final location
        mv "$temp_file" "$restore_file"
        log "Backup decompressed successfully"
    fi
    
    # Restore database
    log "Restoring database from backup..."
    if supabase db reset --file "$restore_file"; then
        success "Emergency recovery completed successfully"
        
        # Clean up temporary file
        if [[ "$restore_file" != "$selected_backup" ]]; then
            rm -f "$restore_file"
        fi
        
        # Log recovery details
        log "Recovery details:"
        log "  Backup file: $selected_backup"
        log "  Restore time: $(date)"
        log "  User: $(whoami)"
        log "  Hostname: $(hostname)"
        
        return 0
    else
        error "Emergency recovery failed"
        return 1
    fi
}

# Cloud backup recovery (if available)
cloud_recovery() {
    log "🌐 Attempting cloud backup recovery..."
    
    # Check if Supabase CLI is configured
    if ! supabase projects list &>/dev/null; then
        error "Supabase CLI not configured or not logged in"
        return 1
    fi
    
    log "Checking for cloud backups..."
    
    # List available backups from Supabase
    local cloud_backups=$(supabase projects backups list "$PROJECT_ID" 2>/dev/null || echo "")
    if [[ -z "$cloud_backups" ]]; then
        error "No cloud backups available"
        return 1
    fi
    
    log "Cloud backups found:"
    echo "$cloud_backups"
    
    # Note: Actual cloud recovery would require Supabase CLI commands
    # This is a placeholder for the recovery process
    warn "Cloud recovery requires manual intervention"
    warn "Please contact Supabase support for cloud backup restoration"
    
    return 1
}

# Database integrity check
check_integrity() {
    log "🔍 Checking database integrity..."
    
    # Check if database is accessible
    if ! supabase db ping &>/dev/null; then
        error "Database is not accessible"
        return 1
    fi
    
    # Check critical tables
    local critical_tables=("profiles" "schools" "classrooms" "students")
    local missing_tables=()
    
    for table in "${critical_tables[@]}"; do
        # Validate table name to prevent SQL injection
        if [[ ! "$table" =~ ^[a-zA-Z_][a-zA-Z0-9_]*$ ]]; then
            echo "Warning: Invalid table name '$table', skipping"
            continue
        fi
        
        # Escape table name for SQL
        local escaped_table="\"$table\""
        
        if ! supabase db query "SELECT 1 FROM $escaped_table LIMIT 1;" &>/dev/null; then
            missing_tables+=("$table")
        fi
    done
    
    if [[ ${#missing_tables[@]} -gt 0 ]]; then
        error "Missing critical tables: ${missing_tables[*]}"
        return 1
    fi
    
    success "Database integrity check passed"
    return 0
}

# Show help
show_help() {
    cat << EOF
Emergency Database Recovery Script

USAGE:
    $0 <command>

COMMANDS:
    recover              Start emergency recovery process
    cloud-recover       Attempt cloud backup recovery
    check-integrity     Check database integrity
    help                Show this help

EMERGENCY PROCEDURES:
    1. Check available local backups
    2. Select most recent backup
    3. Confirm emergency recovery
    4. Restore database from backup
    5. Verify integrity

WARNING:
    This script is for EMERGENCY USE ONLY
    It will overwrite the current database
    All current data will be lost
    Use only when normal recovery fails

EOF
}

# Main script logic
main() {
    local command=${1:-"help"}
    
    # Create emergency log (append mode)
    echo "Emergency Recovery Log - $(date)" >> "$EMERGENCY_LOG"
    
    case $command in
        recover)
            emergency_recovery
            ;;
        cloud-recover)
            cloud_recovery
            ;;
        check-integrity)
            check_integrity
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

# Run main function
main "$@"
