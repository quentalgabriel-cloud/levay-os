#!/usr/bin/env node

import { buildApp } from '../apps/api/src/app.js';
import { getWorkersStatus } from '../apps/workers/src/runner.js';

const commands = {
  health: 'Check system health',
  metrics: 'Show API metrics',
  workers: 'Show workers status',
  all: 'Show full system status'
};

const args = process.argv.slice(2);
const command = args[0] || 'all';

async function healthCheck() {
  console.log('🏥 Running Health Check...\n');
  
  const results = {
    api: 'unknown',
    workers: 'unknown',
    memory: 'unknown'
  };

  try {
    const app = buildApp();
    await app.ready();
    
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events/summary?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    
    results.api = response.statusCode === 200 ? '✅ healthy' : '⚠️ degraded';
    await app.close();
  } catch (e) {
    results.api = `❌ down: ${e.message}`;
  }

  try {
    const mem = process.memoryUsage();
    results.memory = `heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`;
  } catch (e) {
    results.memory = 'unknown';
  }

  console.table(results);
  return results.api === '✅ healthy';
}

async function showMetrics() {
  console.log('📊 API Metrics\n');
  
  const app = buildApp();
  await app.ready();
  
  const endpoints = [
    '/api/v1/crm/leads?tenantId=sollu',
    '/api/v1/billing/receivables?tenantId=sollu',
    '/api/v1/operations/events/summary?tenantId=sollu',
    '/api/v1/audit/stats',
    '/api/v1/quality-gates?tenantId=sollu'
  ];
  
  const results = {};
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    try {
      const response = await app.inject({
        method: 'GET',
        url: endpoint,
        headers: { 'x-tenant-id': 'sollu' }
      });
      const duration = Date.now() - start;
      results[endpoint] = `${response.statusCode} (${duration}ms)`;
    } catch (e) {
      results[endpoint] = `Error: ${e.message}`;
    }
  }
  
  console.table(results);
  await app.close();
}

async function showWorkers() {
  console.log('⚙️ Workers Status\n');
  
  try {
    const status = getWorkersStatus();
    console.log(JSON.stringify(status, null, 2));
  } catch (e) {
    console.log('Workers: unavailable');
  }
}

async function showAll() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║      LEVAY OS - SYSTEM STATUS              ║');
  console.log('╚══════════════════════════════════════════╝\n');
  
  const healthy = await healthCheck();
  console.log('');
  await showMetrics();
  console.log('');
  await showWorkers();
  
  console.log('\n' + (healthy ? '✅ System operational' : '⚠️ System needs attention'));
}

switch (command) {
  case 'health':
    await healthCheck();
    break;
  case 'metrics':
    await showMetrics();
    break;
  case 'workers':
    await showWorkers();
    break;
  default:
    await showAll();
}