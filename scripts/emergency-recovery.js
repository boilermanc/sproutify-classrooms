#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
    console.error('Usage: node emergency-recovery.js <command>');
    console.error('Commands: recover, check-integrity');
    process.exit(1);
}

function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

function warn(message) {
    console.warn(`[${new Date().toISOString()}] WARNING: ${message}`);
}

function error(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
}

function runCommand(cmd, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { stdio: 'pipe' });
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout, stderr });
            } else {
                reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
            }
        });
    });
}

async function checkSupabaseCLI() {
    try {
        await runCommand('supabase', ['--version']);
        log('Supabase CLI is available');
        return true;
    } catch (error) {
        error('Supabase CLI not found. Please install it first.');
        return false;
    }
}

async function listBackups() {
    const backupDir = process.env.BACKUP_DIR || './backups';
    
    if (!fs.existsSync(backupDir)) {
        warn(`Backup directory ${backupDir} does not exist`);
        return [];
    }
    
    try {
        const files = fs.readdirSync(backupDir)
            .filter(file => file.endsWith('.sql'))
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                stats: fs.statSync(path.join(backupDir, file))
            }))
            .sort((a, b) => b.stats.mtime - a.stats.mtime);
        
        return files;
    } catch (error) {
        error(`Failed to read backup directory: ${error.message}`);
        return [];
    }
}

async function recover(command) {
    log('Starting emergency recovery process...');
    
    if (!await checkSupabaseCLI()) {
        process.exit(1);
    }
    
    const backups = await listBackups();
    
    if (backups.length === 0) {
        error('No backup files found. Cannot proceed with recovery.');
        process.exit(1);
    }
    
    log(`Found ${backups.length} backup files:`);
    backups.forEach((backup, index) => {
        log(`  ${index + 1}. ${backup.name} (${backup.stats.mtime.toISOString()})`);
    });
    
    // Use the most recent backup
    const latestBackup = backups[0];
    log(`Using latest backup: ${latestBackup.name}`);
    
    // Create emergency backup before recovery
    const emergencyBackupDir = process.env.BACKUP_DIR || './backups';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const emergencyBackupPath = path.join(emergencyBackupDir, `emergency_backup_${timestamp}.sql`);
    
    log('Creating emergency backup of current state...');
    try {
        await runCommand('supabase', ['db', 'dump', '--file', emergencyBackupPath]);
        log(`Emergency backup created: ${emergencyBackupPath}`);
    } catch (error) {
        warn(`Failed to create emergency backup: ${error.message}`);
        warn('Continuing with recovery...');
    }
    
    // Restore from backup
    log(`Restoring from backup: ${latestBackup.path}`);
    try {
        await runCommand('supabase', ['db', 'reset', '--file', latestBackup.path]);
        log('Recovery completed successfully');
    } catch (error) {
        error(`Recovery failed: ${error.message}`);
        process.exit(1);
    }
}

async function checkIntegrity() {
    log('Starting database integrity check...');
    
    if (!await checkSupabaseCLI()) {
        process.exit(1);
    }
    
    const tables = [
        'profiles',
        'classrooms', 
        'students',
        'towers',
        'plantings',
        'harvests',
        'vitals_logs',
        'pest_logs'
    ];
    
    log('Checking table integrity...');
    
    for (const table of tables) {
        try {
            // Validate table name to prevent SQL injection
            if (!/^[A-Za-z0-9_]+$/.test(table)) {
                error(`Invalid table name: ${table}`);
                continue;
            }
            
            const result = await runCommand('supabase', ['db', 'query', `SELECT COUNT(*) FROM public.${table}`]);
            const count = result.stdout.trim();
            log(`✓ ${table}: ${count} rows`);
        } catch (error) {
            error(`✗ ${table}: ${error.message}`);
        }
    }
    
    log('Integrity check completed');
}

// Main execution
async function main() {
    try {
        switch (command) {
            case 'recover':
                await recover();
                break;
            case 'check-integrity':
                await checkIntegrity();
                break;
            default:
                error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } catch (error) {
        error(`Operation failed: ${error.message}`);
        process.exit(1);
    }
}

main();
