import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Audit & Compliance', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists audit events with filters', async () => {
    const createLead = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', name: 'Lead Audit Test' }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toBeDefined();
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('filters audit events by actor', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?tenantId=sollu&actor=system',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body.items)).toBe(true);
  });

  it('returns available event types', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/event-types',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toContain('auth.login');
    expect(body.items).toContain('lead.stage.changed');
    expect(body.items).toContain('task.created');
  });

  it('returns audit stats', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', name: 'Lead Stats Test' }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/stats',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(response.statusCode).toBe(200);
    const stats = response.json();
    expect(stats.total).toBeDefined();
    expect(typeof stats.total).toBe('number');
  });

  it('enforces tenant isolation on audit events', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { tenantId: 'sollu', name: 'Lead Sollu' }
    });

    const ampResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/audit/events?tenantId=amp213',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(ampResponse.statusCode).toBe(200);
    expect(ampResponse.json().items).toHaveLength(0);
  });

  it('applies retention policy', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/audit/retention',
      headers: { 'x-tenant-id': 'sollu' },
      payload: { retentionDays: 365 }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().message).toBe('Retention policy applied');
  });
});