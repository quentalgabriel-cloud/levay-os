import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('contracts + google drive integration', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('uploads contract and persists metadata', async () => {
    const uploaded = await app.inject({
      method: 'POST',
      url: '/api/v1/contracts/upload',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Contrato',
        contentBase64: 'JVBERi0xLjQ='
      }
    });

    expect(uploaded.statusCode).toBe(201);
    expect(uploaded.json().provider).toBe('google-drive');
    expect(uploaded.json().tenantId).toBe('sollu');

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/contracts?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(list.statusCode).toBe(200);
    expect(list.json().items).toHaveLength(1);
  });

  it('retries on transient failure and succeeds', async () => {
    const uploaded = await app.inject({
      method: 'POST',
      url: '/api/v1/contracts/upload',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Retry',
        contentBase64: 'JVBERi0xLjQ=',
        simulateFailCount: 1
      }
    });

    expect(uploaded.statusCode).toBe(201);

    const audit = await app.inject({
      method: 'GET',
      url: '/api/v1/contracts/audit?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    const events = audit.json().items;
    expect(events.some((item) => item.type === 'contract.upload.retry')).toBe(true);
    expect(events.some((item) => item.type === 'contract.upload.success')).toBe(true);
  });

  it('returns error after max retries and logs failure', async () => {
    const failed = await app.inject({
      method: 'POST',
      url: '/api/v1/contracts/upload',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        customerName: 'Cliente Falha',
        contentBase64: 'JVBERi0xLjQ=',
        simulateFailCount: 5
      }
    });

    expect(failed.statusCode).toBe(502);

    const audit = await app.inject({
      method: 'GET',
      url: '/api/v1/contracts/audit?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(audit.json().items.some((item) => item.type === 'contract.upload.failed')).toBe(true);
  });
});
