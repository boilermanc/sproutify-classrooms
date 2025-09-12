#!/usr/bin/env node
/**
 * Supabase Migration Safety Wrapper
 * Provides additional safety checks for Supabase CLI operations
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SupabaseSafetyWrapper {
    constructor() {
        this.projectId = 'cqrjesmpwaqvmssrdeoc';
        this.backupDir = './backups';
        this.blockedCommands = ['db reset', 'db drop'];
    }

    /**
     * Check if command is potentially dangerous
     */
    isDangerousCommand(command) {
        return this.blockedCommands.some(blocked => 
            command.toLowerCase().includes(blocked.toLowerCase())
        );
    }

    /**
     * Get current environment
     */
    getEnvironment() {
        return process.env.NODE_ENV || 
               process.env.SUPABASE_ENV || 
               process.env.ENVIRONMENT ||
               'development';
    }

    /**
     * Check if we're in production
     */
    isProduction() {
        const env = this.getEnvironment().toLowerCase();
        return env.includes('prod') || env.includes('production') || env.includes('live');
    }

    /**
     * Create backup before dangerous operations
     */
    async createBackup(description = '') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `safety_backup_${timestamp}${description ? '_' + description : ''}`;
        
        console.log(`🔄 Creating safety backup: ${backupName}`);
        
        return new Promise((resolve, reject) => {
            const backupProcess = spawn('supabase', [
                'db', 'dump',
                '--file', path.join(this.backupDir, `${backupName}.sql`),
                '--data-only'
            ], { stdio: 'inherit' });

            backupProcess.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Safety backup created: ${backupName}.sql`);
                    resolve(path.join(this.backupDir, `${backupName}.sql`));
                } else {
                    reject(new Error(`Backup failed with code ${code}`));
                }
            });
        });
    }

    /**
     * Execute supabase command with safety checks
     */
    async executeCommand(args) {
        const command = args.join(' ');
        const env = this.getEnvironment();
        
        console.log(`🔧 Executing: supabase ${command}`);
        console.log(`🌍 Environment: ${env}`);

        // Check for dangerous commands
        if (this.isDangerousCommand(command)) {
            console.log('⚠️  DANGEROUS COMMAND DETECTED!');
            
            if (this.isProduction()) {
                console.error('❌ This command is BLOCKED in production environment!');
                console.error('❌ Use the manual recovery process if absolutely necessary.');
                process.exit(1);
            }

            // Require confirmation for dangerous commands
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question(`⚠️  This command will modify the database. Type "CONFIRM" to proceed: `, resolve);
            });
            rl.close();

            if (answer !== 'CONFIRM') {
                console.log('❌ Command cancelled by user');
                process.exit(1);
            }

            // Create backup before dangerous operation
            try {
                await this.createBackup(`pre_${args[1]}_${args[2] || 'operation'}`);
            } catch (error) {
                console.error('❌ Failed to create backup:', error.message);
                console.error('❌ Aborting operation for safety');
                process.exit(1);
            }
        }

        // Execute the command
        return new Promise((resolve, reject) => {
            const process = spawn('supabase', args, { stdio: 'inherit' });

            process.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Command completed successfully');
                    resolve(code);
                } else {
                    console.error(`❌ Command failed with code ${code}`);
                    reject(new Error(`Command failed with code ${code}`));
                }
            });

            process.on('error', (error) => {
                console.error('❌ Command error:', error.message);
                reject(error);
            });
        });
    }
}

// CLI interface
if (require.main === module) {
    const wrapper = new SupabaseSafetyWrapper();
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
Supabase Safety Wrapper

Usage: node supabase-safe.js <supabase-command> [args...]

Examples:
  node supabase-safe.js db push
  node supabase-safe.js db reset
  node supabase-safe.js db dump --file backup.sql

Safety Features:
  - Automatic backups before dangerous operations
  - Production environment protection
  - Confirmation prompts for destructive commands
  - Environment validation
        `);
        process.exit(0);
    }

    wrapper.executeCommand(args)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}

module.exports = SupabaseSafetyWrapper;
