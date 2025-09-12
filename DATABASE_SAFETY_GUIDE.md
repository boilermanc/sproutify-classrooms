# Database Safety Procedures for Sproutify Classrooms

## Overview
This document outlines the safety procedures and guardrails implemented to prevent accidental database resets and other destructive operations.

## Safety Features Implemented

### 1. Automated Backup System
- **Location**: `scripts/db-safety.sh`, `scripts/db-safety.js`
- **Purpose**: Creates automatic backups before any destructive operation
- **Features**:
  - Timestamped backups with metadata
  - Compression support
  - Backup retention policies
  - Git commit tracking

### 2. Environment Protection
- **Production Blocking**: Certain operations are completely blocked in production
- **Staging Warnings**: Extra confirmations required for staging environments
- **Development**: Minimal restrictions for development work

### 3. Confirmation Prompts
- **Required Phrases**: Specific confirmation phrases must be typed exactly
  - `RESET-DATABASE` for database resets
  - `MIGRATE-PROD` for production migrations
  - `RESTORE` for backup restores
- **Multiple Confirmations**: Production operations require multiple confirmation steps

### 4. Deployment Safety Checks
- **Branch Validation**: Production deployments only from `main` branch
- **Uncommitted Changes**: Warnings for uncommitted changes
- **Migration Detection**: Alerts for recent migration files

## Usage Instructions

### Creating Backups
```bash
# Manual backup
./scripts/db-safety.sh backup

# Backup with description
./scripts/db-safety.sh backup "before_feature_update"

# Using Node.js version
node scripts/db-safety.js backup "pre_migration"
```

### Safe Migrations
```bash
# Development migration
./scripts/db-safety.sh migrate development

# Production migration (requires confirmation)
./scripts/db-safety.sh migrate production
```

### Safe Database Reset
```bash
# Development reset (with backup)
./scripts/db-safety.sh reset development

# Production reset (BLOCKED)
./scripts/db-safety.sh reset production
# ❌ This will fail with error message
```

### Using Supabase Safety Wrapper
```bash
# Safe supabase commands
node scripts/supabase-safe.js db push
node scripts/supabase-safe.js db reset
node scripts/supabase-safe.js db dump --file backup.sql
```

## Recovery Procedures

### If Database Reset Occurs
1. **Check Recent Backups**:
   ```bash
   ./scripts/db-safety.sh list-backups
   ```

2. **Restore from Backup**:
   ```bash
   ./scripts/db-safety.sh restore backups/db_backup_20240101_120000.sql
   ```

3. **Verify Data Integrity**:
   - Check critical tables
   - Verify user accounts
   - Test application functionality

### Emergency Recovery
If automatic recovery fails:
1. Contact system administrator
2. Use Supabase dashboard for manual recovery
3. Restore from cloud backups if available
4. Document the incident for future prevention

## Configuration

### Environment Variables
```bash
# Set environment
export NODE_ENV=production
export SUPABASE_ENV=production

# Disable safety features (NOT RECOMMENDED)
export DB_SAFETY_DISABLED=true
```

### Safety Configuration File
Edit `scripts/db-safety.conf` to modify:
- Safety levels per environment
- Backup retention policies
- Blocked operations list
- Confirmation requirements

## Best Practices

### Before Any Database Operation
1. **Create Backup**: Always create a backup before destructive operations
2. **Check Environment**: Verify you're in the correct environment
3. **Review Changes**: Double-check what changes will be made
4. **Test First**: Test operations in development before production

### Production Operations
1. **Use Main Branch**: Only deploy from `main` branch
2. **Commit Changes**: Ensure all changes are committed
3. **Review Migrations**: Check migration files before deployment
4. **Monitor Closely**: Watch for errors during production operations

### Development Workflow
1. **Use Safety Scripts**: Always use the safety wrappers
2. **Regular Backups**: Create backups before major changes
3. **Test Restores**: Periodically test backup restoration
4. **Document Changes**: Keep track of database changes

## Monitoring and Alerts

### Backup Monitoring
- Check backup directory regularly
- Monitor backup file sizes
- Verify backup integrity

### Environment Monitoring
- Track which environment operations are running in
- Monitor for blocked operations attempts
- Log all safety check results

## Troubleshooting

### Common Issues

#### "Operation Blocked in Production"
- **Cause**: Attempting dangerous operation in production
- **Solution**: Use development environment or manual recovery process

#### "Backup Creation Failed"
- **Cause**: Insufficient permissions or disk space
- **Solution**: Check permissions, free up disk space, verify Supabase CLI

#### "Confirmation Required"
- **Cause**: Safety system requires explicit confirmation
- **Solution**: Type the exact confirmation phrase shown

### Getting Help
1. Check this documentation first
2. Review error messages carefully
3. Check backup availability
4. Contact system administrator if needed

## Security Considerations

### Access Control
- Limit who can run database operations
- Use proper authentication for production access
- Monitor all database operations

### Backup Security
- Store backups securely
- Encrypt sensitive backup data
- Regular backup integrity checks

### Audit Trail
- All operations are logged
- Backup metadata includes user information
- Git commit tracking for all changes

---

**Remember**: These safety measures are designed to protect your data. Never bypass them without understanding the risks and having proper recovery procedures in place.
