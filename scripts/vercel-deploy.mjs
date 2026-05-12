#!/usr/bin/env node
/**
 * Vercel Deploy Script for Levay OS
 * 
 * Usage: node scripts/vercel-deploy.mjs
 * 
 * Prerequisites:
 * 1. Install Vercel CLI: npm i -g vercel
 * 2. Login: vercel login
 * 3. Link project: vercel link
 * 4. Pull env: vercel env pull
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const LEVAY_OS_DIR = join(process.cwd(), 'apps/levay-os');

console.log('🚀 Levay OS - Vercel Deployment\n');

async function runCommand(cmd, options = {}) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { 
      stdio: 'inherit', 
      cwd: options.cwd || LEVAY_OS_DIR,
      ...options 
    });
  } catch (error) {
    if (options.ignoreError) return null;
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

async function deploy() {
  // Step 1: Check if in Vercel project
  console.log('📋 Checking Vercel configuration...');
  
  const vcConfig = join(LEVAY_OS_DIR, '.vercel', 'project.json');
  if (!existsSync(vcConfig)) {
    console.log('⚠️  Not linked to Vercel. Run: vercel link');
    console.log('\nOr manually deploy:');
    console.log('  cd apps/levay-os');
    console.log('  vercel --prod');
    return;
  }

  // Step 2: Build
  console.log('\n📦 Building Next.js app...');
  await runCommand('npm run build');

  // Step 3: Deploy
  console.log('\n🚀 Deploying to Vercel...');
  await runCommand('vercel --prod --yes');

  console.log('\n✅ Deployment complete!');
  console.log('   Check: vercel ls');
}

// Run if called directly
deploy().catch(console.error);

export { deploy };