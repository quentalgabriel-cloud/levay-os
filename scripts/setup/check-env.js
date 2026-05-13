#!/usr/bin/env node

/**
 * Levay OS - Environment Check Script
 * 
 * Verifica se o ambiente está configurado corretamente para desenvolvimento.
 * Uso: node scripts/setup/check-env.js
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log(`\n${COLORS.bold}${COLORS.blue}━━━ ${title} ━━━${COLORS.reset}\n`);
}

function checkSuccess(message) {
  log(`✓ ${message}`, COLORS.green);
}

function checkError(message) {
  log(`✗ ${message}`, COLORS.red);
}

function checkWarning(message) {
  log(`⚠ ${message}`, COLORS.yellow);
}

function checkInfo(message) {
  log(`ℹ ${message}`, COLORS.blue);
}

async function checkNodeVersion() {
  logSection('Node.js');
  
  const version = process.version;
  const majorVersion = parseInt(version.split('.')[0].replace('v', ''));
  
  if (majorVersion >= 18) {
    checkSuccess(`Node.js ${version} - OK`);
    return true;
  } else {
    checkError(`Node.js ${version} - Versão muito antiga. Necessário 18+`);
    return false;
  }
}

async function checkNpmVersion() {
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    const majorVersion = parseInt(version.split('.')[0]);
    
    if (majorVersion >= 8) {
      checkSuccess(`npm ${version} - OK`);
      return true;
    } else {
      checkWarning(`npm ${version} - Versão pode ser instável. Recomendado 8+`);
      return true;
    }
  } catch (e) {
    checkError('npm não encontrado');
    return false;
  }
}

async function checkEnvFile() {
  logSection('Arquivo .env');
  
  const envPath = join(process.cwd(), '.env');
  const envExamplePath = join(process.cwd(), '.env.example');
  
  if (existsSync(envPath)) {
    checkSuccess('.env encontrado');
    
    // Check required variables
    const envContent = readFileSync(envPath, 'utf8');
    const hasDatabase = envContent.includes('DATABASE_URL');
    
    if (hasDatabase) {
      checkSuccess('DATABASE_URL configurado');
    } else {
      checkWarning('DATABASE_URL não encontrado em .env');
    }
    
    return true;
  } else {
    checkWarning('.env não encontrado');
    
    if (existsSync(envExamplePath)) {
      checkInfo('Execute: cp .env.example .env');
    }
    
    return false;
  }
}

async function checkDatabase() {
  logSection('Banco de Dados');
  
  // Try to load dotenv
  let envVars = {};
  try {
    const envPath = join(process.cwd(), '.env');
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          envVars[match[1].trim()] = match[2].trim();
        }
      });
    }
  } catch (e) {
    // Ignore
  }
  
  const dbUrl = (envVars.DATABASE_URL || 'file:./prisma/dev.db').replace(/^["']|["']$/g, '');
  
  // Check if it's SQLite
  if (dbUrl.includes('file:') || dbUrl.includes('.db')) {
    let dbPath = dbUrl.replace('file:', '').replace('./', '');
    
    // If path doesn't have a directory separator, assume it's in prisma/
    if (!dbPath.includes('/') && dbPath.endsWith('.db')) {
      dbPath = 'prisma/' + dbPath;
    }
    
    if (!dbPath.startsWith('/')) {
      dbPath = join(process.cwd(), dbPath);
    }
    
    if (existsSync(dbPath)) {
      checkSuccess(`SQLite database encontrado: ${dbPath}`);
      
      // Check if it has tables
      try {
        const { PrismaClient } = await import('@prisma/client');
        const { Prisma } = await import('@prisma/client');
        
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: dbUrl
            }
          }
        });
        
        await prisma.$connect();
        await prisma.$disconnect();
        checkSuccess('Conexão com banco de dados OK');
        return true;
      } catch (e) {
        checkWarning('Não foi possível conectar ao banco. Execute: npx prisma db push');
        return true; // Not critical
      }
    } else {
      checkWarning(`Banco não encontrado em: ${dbPath}`);
      checkInfo('Execute: npx prisma db push para criar');
      return true; // Not critical
    }
  } else {
    checkInfo(`Banco configurado: ${dbUrl}`);
    return true;
  }
}

async function checkDependencies() {
  logSection('Dependencies');
  
  const nodeModulesPath = join(process.cwd(), 'node_modules');
  
  if (existsSync(nodeModulesPath)) {
    checkSuccess('node_modules instalado');
    return true;
  } else {
    checkWarning('node_modules não encontrado');
    checkInfo('Execute: npm install');
    return false;
  }
}

async function checkDocker() {
  logSection('Docker (Opcional)');
  
  try {
    execSync('docker --version', { encoding: 'utf8' });
    checkSuccess('Docker instalado');
    
    try {
      execSync('docker ps', { encoding: 'utf8' });
      checkSuccess('Docker rodando');
      return true;
    } catch (e) {
      checkWarning('Docker não está rodando');
      return false;
    }
  } catch (e) {
    checkInfo('Docker não instalado (opcional para desenvolvimento local)');
    return true;
  }
}

async function main() {
  log(`${COLORS.bold}Levay OS - Environment Check${COLORS.reset}\n`);
  
  const checks = [
    { name: 'Node.js', fn: checkNodeVersion },
    { name: 'npm', fn: checkNpmVersion },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Configuração', fn: checkEnvFile },
    { name: 'Database', fn: checkDatabase },
    { name: 'Docker', fn: checkDocker }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const passed = await check.fn();
      if (!passed) allPassed = false;
    } catch (e) {
      checkError(`Erro em ${check.name}: ${e.message}`);
      allPassed = false;
    }
  }
  
  logSection('Resumo');
  
  if (allPassed) {
    log('✓ Ambiente configurado corretamente!', COLORS.green);
    log('\nPara iniciar o projeto:', COLORS.bold);
    log('  npm run dev');
    log('\nPara mais informações, consulte SETUP.md');
  } else {
    log('⚠ Algumas verificações falharam', COLORS.yellow);
    log('\nPara configurar o ambiente:');
    log('  1. cp .env.example .env');
    log('  2. npm install');
    log('  3. npx prisma db push');
    log('\nConsulte SETUP.md para detalhes');
  }
  
  process.exit(allPassed ? 0 : 1);
}

main();