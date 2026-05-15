import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';
import { logger } from '../src/middleware/logger.middleware.js';

describe('Observability', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs requests automatically with correlation ID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events/summary?tenantId=sollu',
      headers: { 
        'x-tenant-id': 'sollu',
        'x-correlation-id': 'test-correlation-123'
      }
    });

    expect(response.statusCode).toBe(200);
    
    const logs = logger.queryLogs({ tenantId: 'sollu', eventType: 'request.completed' });
    expect(logs.length).toBeGreaterThan(0);
  });

  it('queries logs with filters', async () => {
    logger.info({ 
      message: 'Test log message', 
      tenantId: 'sollu', 
      module: 'test-module',
      eventType: 'test.event'
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/logs?tenantId=sollu&module=test-module&limit=10',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('returns stats with tenant isolation', async () => {
    logger.info({ message: 'Sollu log', tenantId: 'sollu', module: 'test' });
    logger.info({ message: 'AMP log', tenantId: 'amp213', module: 'test' });

    const solluResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/stats',
      headers: { 'x-tenant-id': 'sollu' }
    });

    const ampResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/stats',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(solluResponse.statusCode).toBe(200);
    expect(ampResponse.statusCode).toBe(200);

    const solluStats = solluResponse.json();
    const ampStats = ampResponse.json();

    expect(solluStats.total).toBeGreaterThan(0);
    expect(ampStats.total).toBe(1);
  });

  it('returns health status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/health',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBeDefined();
    expect(body.metrics).toBeDefined();
  });

  it('filters logs by level', async () => {
    logger.error({ message: 'Error log', tenantId: 'sollu', module: 'test' });
    logger.info({ message: 'Info log', tenantId: 'sollu', module: 'test' });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/observability/logs?tenantId=sollu&level=ERROR',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items.every(l => l.level === 'ERROR')).toBe(true);
  });

  it('isolates logs between tenants', async () => {
    logger.info({ message: 'Sollu only', tenantId: 'sollu', module: 'test' });
    logger.info({ message: 'AMP only', tenantId: 'amp213', module: 'test' });

    const solluLogs = logger.queryLogs({ tenantId: 'sollu' });
    const ampLogs = logger.queryLogs({ tenantId: 'amp213' });

    expect(solluLogs.every(l => l.tenantId === 'sollu')).toBe(true);
    expect(ampLogs.every(l => l.tenantId === 'amp213')).toBe(true);
    expect(solluLogs.length).not.toBe(ampLogs.length);
  });

  it('cleans up old logs', async () => {
    logger.info({ message: 'Old log', tenantId: 'sollu', module: 'test' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/observability/cleanup',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { days: 0 }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().cleared).toBeDefined();
  });
});