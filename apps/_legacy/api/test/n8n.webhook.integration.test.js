import { createHash } from 'node:crypto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

function sign(payload, secret = 'n8n-secret-dev') {
  return createHash('sha256').update(`${JSON.stringify(payload)}:${secret}`).digest('hex');
}

describe('n8n webhook lead ingestion', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('accepts valid payload and creates lead', async () => {
    const payload = {
      eventId: 'evt-1',
      tenantId: 'amp213',
      name: 'Noiva Maria',
      source: 'google-ads',
      campaign: 'wedding-2026',
      timestamp: '2026-03-19T12:00:00.000Z'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/n8n/webhook',
      payload,
      headers: { 'x-n8n-signature': sign(payload), 'x-tenant-id': 'amp213' }
    });

    expect(response.statusCode).toBe(202);
    expect(response.json().accepted).toBe(true);

    const leads = await app.inject({
      method: 'GET',
      url: '/api/v1/crm/leads?tenantId=amp213',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(leads.statusCode).toBe(200);
    expect(leads.json().items).toHaveLength(1);
    expect(leads.json().items[0].name).toBe('Noiva Maria');
  });

  it('rejects invalid signature', async () => {
    const payload = {
      eventId: 'evt-2',
      tenantId: 'amp213',
      name: 'Cliente X',
      source: 'form'
    };

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/n8n/webhook',
      payload,
      headers: { 'x-n8n-signature': 'invalid-signature', 'x-tenant-id': 'amp213' }
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns standardized error for invalid payload and ignores duplicates', async () => {
    const invalidPayload = {
      eventId: 'evt-3',
      tenantId: 'amp213',
      source: 'form'
    };

    const invalidResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/n8n/webhook',
      payload: invalidPayload,
      headers: { 'x-n8n-signature': sign(invalidPayload), 'x-tenant-id': 'amp213' }
    });

    expect(invalidResponse.statusCode).toBe(400);
    expect(invalidResponse.json().message).toBe('Invalid payload');

    const validPayload = {
      eventId: 'evt-4',
      tenantId: 'amp213',
      name: 'Empresa Y',
      source: 'landing-page'
    };

    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/n8n/webhook',
      payload: validPayload,
      headers: { 'x-n8n-signature': sign(validPayload), 'x-tenant-id': 'amp213' }
    });

    const duplicate = await app.inject({
      method: 'POST',
      url: '/api/v1/integrations/n8n/webhook',
      payload: validPayload,
      headers: { 'x-n8n-signature': sign(validPayload), 'x-tenant-id': 'amp213' }
    });

    expect(first.statusCode).toBe(202);
    expect(duplicate.statusCode).toBe(202);
    expect(duplicate.json().duplicate).toBe(true);
  });
});
