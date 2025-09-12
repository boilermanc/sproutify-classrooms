#!/usr/bin/env node
/**
 * Database Safety Guard - Node.js Version
 * Provides programmatic safety checks for database operations
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { promisify } = require('util');

class DatabaseSafetyGuard {
    constructor(options = {}) {
        this.config = {
            autoBackup: options.autoBackup !== false,
            requireConfirmation: options.requireConfirmation !== false,
            backupDir: options.backupDir || './backups',
            projectId: options.projectId || 'cqrjesmpwaqvmssrdeoc',
            ...options
        };
        
        this.blockedOperations = [
            'db reset',
            'db drop',
            'schema drop',
            'data truncate'
        ];
        
        this.productionIndicators = ['prod', 'production', 'live', 'main'];
        this.stagingIndicators = ['staging', 'stage', 'test', 'preview'];
    }

    /**
     * Check if current environment is production
     */
    isProduction(env = this.getEnvironment()) {
        return this.productionIndicators.some(indicator => 
            env.toLowerCase().includes(indicator)
        );
    }

    /**
     * Check if current environment is staging
     */
    isStaging(env = this.getEnvironment()) {
        return this.stagingIndicators.some(indicator => 
            env.toLowerCase().includes(indicator)
        );
    }

    /**
     * Get current environment from various sources
     */
    getEnvironment() {
        return process.env.NODE_ENV || 
               process.env.ENVIRONMENT || 
               process.env.SUPABASE_ENV ||
               'development';
    }

    /**
     * Get current git branch
     */
    getCurrentBranch() {
        try {
            return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * Check if operation is blocked in current environment
     */
    isOperationBlocked(operation, env = this.getEnvironment()) {
        if (this.isProduction(env)) {
            return this.blockedOperations.some(blocked => 
                operation.toLowerCase().includes(blocked)
            );
        }
        return false;
    }

    /**
     * Create database backup
     */
    async createBackup(description = '') {
        // Create safe filename-safe timestamp
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const timestamp = `${year}${month}${day}_${hour}${minute}${second}`;
        
        const backupName = `db_backup_${timestamp}${description ? '_' + description : ''}`;
        const backupFile = path.join(this.config.backupDir, `${backupName}.sql`);
        
        // Validate backup filename for security
        const safeBackupName = backupName.replace(/[^A-Za-z0-9_-]/g, '');
        if (safeBackupName !== backupName) {
            throw new Error('Invalid characters in backup description');
        }
        
        // Ensure backup directory exists
        try {
            await fs.access(this.config.backupDir);
        } catch {
            await fs.mkdir(this.config.backupDir, { recursive: true });
        }

        console.log(`Creating backup: ${backupFile}`);
        
        try {
            // Create backup using supabase CLI with safe arguments
            const child = spawn('supabase', ['db', 'dump', '--file', backupFile, '--data-only'], {
                stdio: 'inherit'
            });
            
            await new Promise((resolve, reject) => {
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Backup command failed with exit code ${code}`));
                    }
                });
                child.on('error', reject);
            });
            
            // Create metadata file
            const metadata = {
                timestamp: new Date().toISOString(),
                backupFile: backupFile,
                projectId: this.config.projectId,
                createdBy: process.env.USER || process.env.USERNAME || 'unknown',
                hostname: require('os').hostname(),
                gitBranch: this.getCurrentBranch(),
                gitCommit: this.getGitCommit(),
                description: description,
                environment: this.getEnvironment()
            };
            
            await fs.writeFile(
                `${backupFile}.meta.json`, 
                JSON.stringify(metadata, null, 2)
            );
            
            console.log(`✅ Backup created successfully: ${backupFile}`);
            return backupFile;
            
        } catch (error) {
            console.error(`❌ Failed to create backup: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get current git commit hash
     */
    getGitCommit() {
        try {
            return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
        } catch (error) {
            return 'unknown';
        }
    }

    /**
     * List recent backups
     */
    listBackups(limit = 10) {
        if (!fs.existsSync(this.config.backupDir)) {
            console.log('No backup directory found');
            return [];
        }

        const files = fs.readdirSync(this.config.backupDir)
            .filter(file => file.endsWith('.sql'))
            .map(file => {
                const filePath = path.join(this.config.backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    file: file,
                    path: filePath,
                    size: stats.size,
                    created: stats.birthtime
                };
            })
            .sort((a, b) => b.created - a.created)
            .slice(0, limit);

        console.log('Recent backups:');
        files.forEach(backup => {
            console.log(`  ${backup.file} (${this.formatBytes(backup.size)}) - ${backup.created.toISOString()}`);
        });

        return files;
    }

    /**
     * Format bytes to human readable format
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Safe migration runner
     */
    async runMigrations(env = this.getEnvironment()) {
        console.log(`Running migrations for environment: ${env}`);

        // Check if operation is blocked
        if (this.isOperationBlocked('migrate', env)) {
            throw new Error(`Migration blocked in ${env} environment`);
        }

        // Production safety check
        if (this.isProduction(env)) {
            console.log('🚨 PRODUCTION MIGRATION DETECTED!');
            if (this.config.requireConfirmation) {
                const readline = require('readline');
                const rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                const answer = await new Promise(resolve => {
                    rl.question('Type "MIGRATE-PROD" to confirm: ', resolve);
                });
                rl.close();

                if (answer !== 'MIGRATE-PROD') {
                    throw new Error('Production migration cancelled by user');
                }
            }
        }

        // Create backup before migration
        if (this.config.autoBackup) {
            await this.createBackup('pre_migration');
        }

        // Run migrations
        try {
            const child = spawn('supabase', ['db', 'push'], { stdio: 'inherit' });
            
            await new Promise((resolve, reject) => {
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Migration command failed with exit code ${code}`));
                    }
                });
                child.on('error', reject);
            });
            
            console.log('✅ Migrations applied successfully');
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    }

    /**
     * Safe database reset
     */
    async resetDatabase(env = this.getEnvironment(), force = false) {
        console.log(`Database reset requested for environment: ${env}`);

        // Block production resets
        if (this.isProduction(env)) {
            throw new Error('❌ PRODUCTION DATABASE RESET BLOCKED! This operation is not allowed in production.');
        }

        // Require confirmation
        if (this.config.requireConfirmation && !force) {
            console.log('⚠️  This will COMPLETELY WIPE the database!');
            console.log('⚠️  All data will be lost!');
            
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('Type "RESET-DATABASE" to confirm: ', resolve);
            });
            rl.close();

            if (answer !== 'RESET-DATABASE') {
                throw new Error('Database reset cancelled by user');
            }
        }

        // Create backup before reset
        if (this.config.autoBackup) {
            await this.createBackup('pre_reset');
        }

        // Perform reset
        try {
            const child = spawn('supabase', ['db', 'reset'], { stdio: 'inherit' });
            
            await new Promise((resolve, reject) => {
                child.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Reset command failed with exit code ${code}`));
                    }
                });
                child.on('error', reject);
            });
            
            console.log('✅ Database reset completed successfully');
        } catch (error) {
            console.error('❌ Database reset failed:', error.message);
            throw error;
        }
    }

    /**
     * Validate environment safety
     */
    validateEnvironment(operation, env = this.getEnvironment()) {
        const issues = [];

        if (this.isProduction(env)) {
            if (this.isOperationBlocked(operation, env)) {
                issues.push(`Operation "${operation}" is blocked in production`);
            }
            
            if (this.getCurrentBranch() !== 'main') {
                issues.push('Production operations should only run from main branch');
            }
        }

        if (issues.length > 0) {
            throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
        }

        return true;
    }
}

// CLI interface
if (require.main === module) {
    const guard = new DatabaseSafetyGuard();
    const command = process.argv[2];
    const args = process.argv.slice(3);

    // Input validation
    function validateInput() {
        const allowedCommands = ['backup', 'list-backups', 'migrate', 'reset', 'validate'];
        
        if (!command || !allowedCommands.includes(command)) {
            console.error('Error: Invalid or missing command');
            console.error('Valid commands:', allowedCommands.join(', '));
            process.exit(1);
        }
        
        // Validate command-specific arguments
        switch (command) {
            case 'migrate':
            case 'reset':
                if (!args[0] || !args[0].trim()) {
                    console.error(`Error: ${command} requires an environment argument`);
                    console.error('Valid environments: development, staging, production');
                    process.exit(1);
                }
                const validEnvs = ['development', 'staging', 'production', 'dev', 'stage', 'prod'];
                if (!validEnvs.includes(args[0].toLowerCase())) {
                    console.error(`Error: Invalid environment "${args[0]}"`);
                    console.error('Valid environments:', validEnvs.join(', '));
                    process.exit(1);
                }
                break;
                
            case 'validate':
                if (!args[0] || !args[0].trim()) {
                    console.error('Error: validate requires an operation name');
                    process.exit(1);
                }
                break;
                
            case 'list-backups':
                if (args[0] && (isNaN(parseInt(args[0])) || parseInt(args[0]) < 1)) {
                    console.error('Error: list-backups limit must be a positive number');
                    process.exit(1);
                }
                break;
                
            case 'backup':
                if (args[0] && typeof args[0] !== 'string') {
                    console.error('Error: backup description must be a string');
                    process.exit(1);
                }
                break;
        }
        
        // Validate --force flag
        if (args.includes('--force') && command !== 'reset') {
            console.error('Error: --force flag is only valid for reset command');
            process.exit(1);
        }
    }

    async function main() {
        try {
            validateInput();
            
            switch (command) {
                case 'backup':
                    await guard.createBackup(args[0] || '');
                    break;
                case 'list-backups':
                    guard.listBackups(parseInt(args[0]) || 10);
                    break;
                case 'migrate':
                    await guard.runMigrations(args[0]);
                    break;
                case 'reset':
                    await guard.resetDatabase(args[0], args.includes('--force'));
                    break;
                case 'validate':
                    guard.validateEnvironment(args[0], args[1]);
                    console.log('✅ Environment validation passed');
                    break;
                default:
                    console.log(`
Database Safety Guard

Usage: node db-safety.js <command> [options]

Commands:
  backup [description]     Create a database backup
  list-backups [limit]    List recent backups
  migrate [env]           Run migrations safely
  reset [env] [--force]   Reset database (with safety checks)
  validate <operation>    Validate environment for operation

Options:
  --force                 Force operation (bypass some safety checks)
                    `);
                    break;
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    main();
}

module.exports = DatabaseSafetyGuard;
