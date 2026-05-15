import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Actions intent API', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('executes intent actions for crm, billing and quality gates', async () => {
    const leadResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead Intent'
      }
    });
    const lead = leadResponse.json();

    const receivableResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/billing/receivables',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Intent',
        amount: 1200,
        dueDate: '2026-03-25'
      }
    });
    const receivable = receivableResponse.json();

    const gateResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/quality-gates',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        flowName: 'billing.collection',
        stepName: 'send_whatsapp',
        reason: 'manual_review'
      }
    });
    const gate = gateResponse.json();

    const leadIntent = await app.inject({
      method: 'POST',
      url: '/api/v1/actions/intent',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actionId: 'crm.advance-proposal',
        payload: { leadId: lead.id },
        actor: 'intent-user',
        role: 'commercial'
      }
    });

    expect(leadIntent.statusCode).toBe(202);
    expect(leadIntent.json().ok).toBe(true);

    const billingIntent = await app.inject({
      method: 'POST',
      url: '/api/v1/actions/intent',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actionId: 'billing.collect',
        payload: { receivableId: receivable.id, channel: 'whatsapp' },
        actor: 'intent-user',
        role: 'financeiro'
      }
    });

    expect(billingIntent.statusCode).toBe(202);
    expect(billingIntent.json().ok).toBe(true);

    const gateIntent = await app.inject({
      method: 'POST',
      url: '/api/v1/actions/intent',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actionId: 'gates.approve',
        payload: { gateId: gate.id, justification: 'ok' },
        actor: 'intent-user',
        role: 'operations'
      }
    });

    expect(gateIntent.statusCode).toBe(202);
    expect(gateIntent.json().ok).toBe(true);
  });
});
