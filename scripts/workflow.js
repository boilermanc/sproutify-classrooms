#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runCommand(cmd, args = [], options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(cmd, args, { 
            stdio: 'inherit', 
            shell: true,
            ...options 
        });
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });
    });
}

async function getCurrentBranch() {
    try {
        const { execSync } = await import('child_process');
        return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
        throw new Error('Could not determine current git branch');
    }
}

async function checkUncommittedChanges() {
    try {
        const { execSync } = await import('child_process');
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        return status.trim().length > 0;
    } catch (error) {
        return false;
    }
}

async function pushToDev() {
    console.log('🚀 PUSHING TO DEV FOR TESTING\n');
    
    const currentBranch = await getCurrentBranch();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    if (currentBranch !== 'dev') {
        console.log('⚠️  You are not on the dev branch!');
        console.log('Switching to dev branch...');
        await runCommand('git', ['checkout', 'dev']);
    }
    
    const hasChanges = await checkUncommittedChanges();
    if (hasChanges) {
        console.log('📝 You have uncommitted changes.');
        console.log('Please commit your changes first:');
        console.log('  git add .');
        console.log('  git commit -m "Your commit message"');
        process.exit(1);
    }
    
    console.log('📤 Pushing dev branch to origin...');
    await runCommand('git', ['push', 'origin', 'dev']);
    
    console.log('🧪 Deploying to TEST environment...');
    await runCommand('npm', ['run', 'deploy:test']);
    
    console.log('✅ Dev branch pushed and deployed to test environment!');
    console.log('🔗 Test URL: http://100.96.83.5:8081/');
}

async function pushCurrentBranchToTest() {
    console.log('🚀 PUSHING CURRENT BRANCH TO TEST\n');
    
    const currentBranch = await getCurrentBranch();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    const hasChanges = await checkUncommittedChanges();
    if (hasChanges) {
        console.log('📝 You have uncommitted changes.');
        console.log('Please commit your changes first:');
        console.log('  git add .');
        console.log('  git commit -m "Your commit message"');
        process.exit(1);
    }
    
    console.log(`📤 Pushing ${currentBranch} branch to origin...`);
    await runCommand('git', ['push', 'origin', currentBranch]);
    
    console.log('🧪 Deploying to TEST environment...');
    await runCommand('npm', ['run', 'deploy:test']);
    
    console.log(`✅ ${currentBranch} branch pushed and deployed to test environment!`);
    console.log('🔗 Test URL: http://100.96.83.5:8081/');
}

async function mergeToMain() {
    console.log('🔄 MERGING DEV TO MAIN\n');
    
    const currentBranch = await getCurrentBranch();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    if (currentBranch !== 'dev') {
        console.log('⚠️  You should be on dev branch to merge to main!');
        console.log('Switching to dev branch...');
        await runCommand('git', ['checkout', 'dev']);
    }
    
    const hasChanges = await checkUncommittedChanges();
    if (hasChanges) {
        console.log('📝 You have uncommitted changes.');
        console.log('Please commit your changes first:');
        console.log('  git add .');
        console.log('  git commit -m "Your commit message"');
        process.exit(1);
    }
    
    console.log('📤 Pushing dev branch to origin...');
    await runCommand('git', ['push', 'origin', 'dev']);
    
    console.log('🔄 Switching to main branch...');
    await runCommand('git', ['checkout', 'main']);
    
    console.log('📥 Pulling latest main...');
    await runCommand('git', ['pull', 'origin', 'main']);
    
    console.log('🔀 Merging dev into main...');
    await runCommand('git', ['merge', 'dev', '--no-ff', '-m', 'Merge dev to main for production deployment']);
    
    console.log('📤 Pushing merged main to origin...');
    await runCommand('git', ['push', 'origin', 'main']);
    
    console.log('✅ Successfully merged dev to main!');
    console.log('🎯 Ready for production deployment');
}

async function deployFromMain() {
    console.log('🚀 DEPLOYING FROM MAIN TO PRODUCTION\n');
    
    const currentBranch = await getCurrentBranch();
    console.log(`📍 Current branch: ${currentBranch}`);
    
    if (currentBranch !== 'main') {
        console.log('⚠️  You must be on main branch to deploy to production!');
        console.log('Switching to main branch...');
        await runCommand('git', ['checkout', 'main']);
    }
    
    console.log('📥 Pulling latest main...');
    await runCommand('git', ['pull', 'origin', 'main']);
    
    console.log('🌐 Deploying to PRODUCTION environment...');
    await runCommand('npm', ['run', 'deploy:prod']);
    
    console.log('✅ Successfully deployed to production!');
    console.log('🔗 Production URL: https://school.sproutify.app/');
}

async function showWorkflow() {
    console.log('\n🚀 SPROUTIFY DEPLOYMENT WORKFLOW\n');
    console.log('📋 STEP-BY-STEP WORKFLOW:');
    console.log('');
    console.log('1️⃣  TEST YOUR CHANGES:');
    console.log('   npm run workflow:test');
    console.log('   (Pushes dev → dev, deploys to test)');
    console.log('');
    console.log('2️⃣  MERGE TO MAIN:');
    console.log('   npm run workflow:merge');
    console.log('   (Merges dev → main)');
    console.log('');
    console.log('3️⃣  DEPLOY TO PRODUCTION:');
    console.log('   npm run workflow:prod');
    console.log('   (Deploys from main → production)');
    console.log('');
    console.log('⚡ OR RUN ALL STEPS:');
    console.log('   npm run workflow:all');
    console.log('');
    
    const currentBranch = await getCurrentBranch();
    const hasChanges = await checkUncommittedChanges();
    
    console.log('🔧 CURRENT STATUS:');
    console.log(`📍 Branch: ${currentBranch}`);
    console.log(`📝 Uncommitted changes: ${hasChanges ? 'Yes' : 'No'}`);
    
    if (hasChanges) {
        console.log('\n⚠️  You have uncommitted changes. Commit them first:');
        console.log('   git add .');
        console.log('   git commit -m "Your message"');
    }
}

async function runAllSteps() {
    console.log('🚀 RUNNING COMPLETE WORKFLOW\n');
    
    try {
        console.log('Step 1: Testing on dev...');
        await pushToDev();
        
        console.log('\nStep 2: Merging to main...');
        await mergeToMain();
        
        console.log('\nStep 3: Deploying to production...');
        await deployFromMain();
        
        console.log('\n🎉 COMPLETE WORKFLOW FINISHED!');
        console.log('✅ Dev → Test → Main → Production');
        
    } catch (error) {
        console.error('\n❌ Workflow failed:', error.message);
        console.log('\nPlease check the error and try again.');
        process.exit(1);
    }
}

const command = process.argv[2];

switch (command) {
    case 'test':
        await pushToDev();
        break;
    case 'test-current':
        await pushCurrentBranchToTest();
        break;
    case 'merge':
        await mergeToMain();
        break;
    case 'prod':
        await deployFromMain();
        break;
    case 'all':
        await runAllSteps();
        break;
    case 'help':
    case undefined:
        await showWorkflow();
        break;
    default:
        console.log('Usage: node workflow.js [test|test-current|merge|prod|all|help]');
        console.log('  test         - Push dev to dev and deploy to test');
        console.log('  test-current - Push current branch to test');
        console.log('  merge        - Merge dev to main');
        console.log('  prod         - Deploy from main to production');
        console.log('  all          - Run complete workflow');
        console.log('  help         - Show workflow guide');
        process.exit(1);
}