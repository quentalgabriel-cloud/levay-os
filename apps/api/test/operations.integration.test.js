import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('operations events', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('publishes and lists operational events with tenant filtering', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'followup.dispatched',
        flow: 'sollu.followup',
        status: 'success',
        payload: {
          leadId: 'lead-1'
        }
      }
    });

    expect(created.statusCode).toBe(201);
    expect(created.json().tenantId).toBe('sollu');

    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        type: 'lead.created',
        flow: 'amp213.leads',
        status: 'success'
      }
    });

    const listed = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json().items).toHaveLength(1);
    expect(listed.json().items[0].type).toBe('followup.dispatched');
  });

  it('summarizes operational events by tenant and flow', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'followup.dispatched',
        flow: 'sollu.followup',
        status: 'success'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'followup.retry_scheduled',
        flow: 'sollu.followup',
        status: 'retry'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'followup.dead_letter',
        flow: 'sollu.followup',
        status: 'dead-letter'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'collection.triggered',
        flow: 'sollu.billing',
        status: 'success'
      }
    });

    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        type: 'lead.created',
        flow: 'amp213.leads',
        status: 'success'
      }
    });

    const summary = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events/summary?tenantId=sollu&flow=sollu.followup',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(summary.statusCode).toBe(200);
    const body = summary.json();
    expect(body.tenantId).toBe('sollu');
    expect(body.flow).toBe('sollu.followup');
    expect(body.total).toBe(3);
    expect(body.success).toBe(1);
    expect(body.retry).toBe(1);
    expect(body.deadLetter).toBe(1);
    expect(body.breakdownByType).toEqual([
      { type: 'followup.dead_letter', count: 1 },
      { type: 'followup.dispatched', count: 1 },
      { type: 'followup.retry_scheduled', count: 1 }
    ]);
  });

  it('applies cors headers and handles preflight requests', async () => {
    const preflight = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/operations/events',
      headers: {
        origin: 'http://localhost:3200',
        'access-control-request-method': 'POST'
      }
    });

    expect(preflight.statusCode).toBe(204);
    expect(preflight.headers['access-control-allow-origin']).toBe('http://localhost:3200');
    expect(preflight.headers['access-control-allow-methods']).toContain('OPTIONS');

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu', origin: 'http://localhost:3200' }
    });

    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3200');
  });

  it('allows tenant query fallback for read-only operations summary and stream', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'followup.dispatched',
        flow: 'sollu.followup',
        status: 'success'
      }
    });

    const summary = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events/summary?tenantId=sollu',
      headers: { origin: 'http://localhost:3201' }
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().tenantId).toBe('sollu');
    expect(summary.headers['access-control-allow-origin']).toBe('http://localhost:3201');

    const streamPreflight = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/operations/events/stream?tenantId=sollu',
      headers: { origin: 'http://localhost:3201' }
    });

    expect(streamPreflight.statusCode).toBe(204);
    expect(streamPreflight.headers['access-control-allow-origin']).toBe('http://localhost:3201');
  });

  it('filters operations events and summaries by since timestamp', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/operations/events',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        type: 'recommendation.executed',
        flow: 'sollu.recommendation',
        status: 'success'
      }
    });

    const future = new Date(Date.now() + 60_000).toISOString();

    const listed = await app.inject({
      method: 'GET',
      url: `/api/v1/operations/events?tenantId=sollu&since=${encodeURIComponent(future)}`,
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json().items).toHaveLength(0);

    const summary = await app.inject({
      method: 'GET',
      url: `/api/v1/operations/events/summary?tenantId=sollu&since=${encodeURIComponent(future)}`,
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(summary.statusCode).toBe(200);
    expect(summary.json().total).toBe(0);
  });

  it('bootstraps demo data and exposes cors on sse stream', async () => {
    const bootstrapped = await app.inject({
      method: 'POST',
      url: '/api/v1/demo/bootstrap',
      payload: { tenantId: 'sollu' }
    });

    expect(bootstrapped.statusCode).toBe(201);
    const seeded = bootstrapped.json();
    expect(seeded.tenantId).toBe('sollu');
    expect(seeded.operationsSeeded).toBe(true);

    const leads = await app.inject({
      method: 'GET',
      url: '/api/v1/crm/leads?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    expect(leads.json().items.length).toBeGreaterThan(0);

    const receivables = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/receivables?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    expect(receivables.json().items.length).toBeGreaterThan(0);

    const pendingGates = await app.inject({
      method: 'GET',
      url: '/api/v1/quality-gates/pending?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    expect(pendingGates.json().items.length).toBeGreaterThan(0);

    const contracts = await app.inject({
      method: 'GET',
      url: '/api/v1/contracts?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    expect(contracts.json().items.length).toBeGreaterThan(0);

    const analytics = await app.inject({
      method: 'GET',
      url: '/api/v1/analytics/executive?tenantId=sollu',
      headers: { 'x-role': 'manager', 'x-tenant-id': 'sollu' }
    });
    expect(analytics.json().tenants.length).toBeGreaterThan(0);

    const operations = await app.inject({
      method: 'GET',
      url: '/api/v1/operations/events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });
    expect(operations.json().items.some((item) => item.type === 'demo.bootstrap.completed')).toBe(true);

    const streamPreflight = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/operations/events/stream?tenantId=sollu'
    });
    expect(streamPreflight.statusCode).toBe(204);
    expect(streamPreflight.headers['access-control-allow-origin']).toBe('http://localhost:3200');
    expect(streamPreflight.headers['access-control-allow-methods']).toContain('OPTIONS');
  });
});
