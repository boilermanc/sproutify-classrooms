#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const platform = os.platform();
const args = process.argv.slice(2);

function runDeployScript(environment, force = false, mergeOnly = false, mergeFirst = false) {
    const scriptPath = path.join(__dirname, '..', 'deploy_school.ps1');
    
    let command, args;
    
    if (platform === 'win32') {
        // Windows - use PowerShell
        command = 'powershell';
        args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, environment];
        if (force) args.push('-Force');
        if (mergeOnly) args.push('-MergeOnly');
        if (mergeFirst) args.push('-MergeFirst');
    } else {
        // macOS/Linux - use PowerShell Core if available, otherwise show error
        command = 'pwsh';
        args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, environment];
        if (force) args.push('-Force');
        if (mergeOnly) args.push('-MergeOnly');
        if (mergeFirst) args.push('-MergeFirst');
    }
    
    console.log(`Running deployment for ${environment} environment...`);
    console.log(`Command: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
        stdio: 'inherit',
        cwd: process.cwd()
    });
    
    child.on('error', (error) => {
        if (error.code === 'ENOENT') {
            console.error(`Error: ${command} not found.`);
            if (platform !== 'win32') {
                console.error('Please install PowerShell Core (pwsh) to run deployment scripts on macOS/Linux.');
                console.error('Visit: https://docs.microsoft.com/en-us/powershell/scripting/install/installing-powershell-core-on-linux');
            }
        } else {
            console.error('Deployment failed:', error.message);
        }
        process.exit(1);
    });
    
    child.on('close', (code) => {
        if (code === 0) {
            console.log(`Deployment to ${environment} completed successfully.`);
        } else {
            console.error(`Deployment failed with exit code ${code}`);
            process.exit(code);
        }
    });
}

// Parse command line arguments
const environment = args[0];
const force = args.includes('--force') || args.includes('-Force');
const mergeOnly = args.includes('--merge-only') || args.includes('-MergeOnly');
const mergeFirst = args.includes('--merge-first') || args.includes('-MergeFirst');

if (!environment) {
    console.error('Usage: node deploy.js <environment> [--force] [--merge-only] [--merge-first]');
    console.error('Environments: auto, test, prod');
    console.error('Options:');
    console.error('  --force       Bypass confirmation & branch guards');
    console.error('  --merge-only  Only merge to main, don\'t deploy');
    console.error('  --merge-first Merge to main first, then deploy');
    process.exit(1);
}

if (!['auto', 'test', 'prod'].includes(environment)) {
    console.error('Invalid environment. Must be one of: auto, test, prod');
    process.exit(1);
}

runDeployScript(environment, force, mergeOnly, mergeFirst);
