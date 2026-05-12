import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('executive analytics', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('aggregates KPIs by tenant and consolidated', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', revenue: 1000, conversion: 0.5, efficiency: 0.9, createdAt: '2026-03-19T10:00:00.000Z' }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: { tenantId: 'amp213', revenue: 500, conversion: 0.3, efficiency: 0.7, createdAt: '2026-03-19T11:00:00.000Z' }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/executive',
      headers: { 'x-role': 'ceo', 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().tenants).toHaveLength(2);
    expect(response.json().consolidated.revenue).toBe(1500);
  });

  it('supports tenant and period filters', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', revenue: 100, conversion: 0.2, efficiency: 0.6, createdAt: '2026-01-10T00:00:00.000Z' }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/analytics/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', revenue: 300, conversion: 0.4, efficiency: 0.8, createdAt: '2026-03-10T00:00:00.000Z' }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/executive?tenantId=sollu&from=2026-03-01T00:00:00.000Z&to=2026-03-31T23:59:59.000Z',
      headers: { 'x-role': 'manager', 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().tenants).toHaveLength(1);
    expect(response.json().consolidated.revenue).toBe(300);
  });

  it('rejects mismatched tenant filters for non-ceo roles', async () => {
    const forbidden = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/executive?tenantId=amp213',
      headers: { 'x-role': 'manager', 'x-tenant-id': 'sollu' }
    });

    expect(forbidden.statusCode).toBe(403);
  });
});
