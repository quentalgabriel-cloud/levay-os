import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Billing Sollu', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates and lists receivables for tenant', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente 1',
        amount: 1200,
        dueDate: '2026-03-25'
      }
    });

    expect(created.statusCode).toBe(201);

    const listed = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/receivables?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(listed.statusCode).toBe(200);
    expect(listed.json().items).toHaveLength(1);
    expect(listed.json().items[0].status).toBe('pending');
  });

  it('triggers collection and records billing events', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente 2',
        amount: 900,
        dueDate: '2026-03-26'
      }
    });
    const receivable = created.json();

    const collection = await app.inject({
      method: 'POST',
      url: `/api/v1/billing/receivables/${receivable.id}/collect`,
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        channel: 'whatsapp'
      }
    });

    expect(collection.statusCode).toBe(202);

    const events = await app.inject({
      method: 'GET',
      url: '/api/v1/billing/events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(events.statusCode).toBe(200);
    expect(events.json().items).toHaveLength(1);
    expect(events.json().items[0].type).toBe('collection.triggered');
  });

  it('applies payment callback and updates status with tenant isolation', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente 3',
        amount: 500,
        dueDate: '2026-03-27'
      }
    });
    const receivable = created.json();

    const callback = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/payment-callback',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        providerPayload: {
          receivableId: receivable.id,
          status: 'paid',
          paidAt: '2026-03-21T12:00:00.000Z'
        }
      }
    });

    expect(callback.statusCode).toBe(200);
    expect(callback.json().status).toBe('paid');

    const wrongTenant = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/payment-callback',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        providerPayload: {
          receivableId: receivable.id,
          status: 'paid'
        }
      }
    });

    expect(wrongTenant.statusCode).toBe(404);
  });

  it('collects all pending receivables in bulk', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Bulk 1',
        amount: 300,
        dueDate: '2026-03-30'
      }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Bulk 2',
        amount: 450,
        dueDate: '2026-03-30'
      }
    });

    const bulk = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/collect-pending',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        channel: 'whatsapp'
      }
    });

    expect(bulk.statusCode).toBe(202);
    expect(bulk.json().processed).toBe(2);
    expect(bulk.json().totalPending).toBe(2);
  });
});
