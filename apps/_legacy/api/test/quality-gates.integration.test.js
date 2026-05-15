import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('quality gates', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates gate and lists pending queue', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'billing.collection',
        stepName: 'send_whatsapp',
        reason: 'high_amount'
      }
    });

    expect(created.statusCode).toBe(201);

    const pending = await app.inject({
      method: 'GET',
      url: '/api/v1/quality-gates/pending?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(pending.statusCode).toBe(200);
    expect(pending.json().items).toHaveLength(1);
    expect(pending.json().items[0].status).toBe('pending');
  });

  it('approves gate with actor and justification and writes audit', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'contract.send',
        stepName: 'dispatch_contract',
        reason: 'manual_review'
      }
    });

    const decision = await app.inject({
      method: 'POST',
      url: `/api/v1/quality-gates/${created.json().id}/decision`,
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actor: 'finance_manager',
        decision: 'approved',
        justification: 'cliente validado'
      }
    });

    expect(decision.statusCode).toBe(200);
    expect(decision.json().status).toBe('approved');

    const decisions = await app.inject({
      method: 'GET',
      url: '/api/v1/quality-gates/decisions?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(decisions.statusCode).toBe(200);
    expect(decisions.json().items).toHaveLength(1);
    expect(decisions.json().items[0].actor).toBe('finance_manager');
  });

  it('rejects decision without authorization details', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'billing.collection',
        stepName: 'dispatch',
        reason: 'manual_review'
      }
    });

    const invalid = await app.inject({
      method: 'POST',
      url: `/api/v1/quality-gates/${created.json().id}/decision`,
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        decision: 'rejected'
      }
    });

    expect(invalid.statusCode).toBe(409);
  });

  it('approves all pending gates in bulk', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'billing.collection',
        stepName: 'dispatch_bulk_1',
        reason: 'manual_review'
      }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'billing.collection',
        stepName: 'dispatch_bulk_2',
        reason: 'manual_review'
      }
    });

    const bulk = await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates/approve-pending',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actor: 'ops-manager',
        justification: 'limpeza de fila operacional'
      }
    });

    expect(bulk.statusCode).toBe(200);
    expect(bulk.json().processed).toBe(2);
    expect(bulk.json().failed).toBe(0);
    expect(bulk.json().totalPending).toBe(2);
  });
});
