import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('dashboard context', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('exposes allowed cards and sections per role using header context', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/context',
      headers: {
        'x-tenant-id': 'sollu',
        'x-role': 'operations'
      }
    });

    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(payload.tenantId).toBe('sollu');
    expect(payload.role).toBe('operations');
    expect(payload.contract.cards.some((card) => card.id === 'reservations')).toBe(true);
    expect(payload.contract.sections.length).toBeGreaterThan(0);
  });

  it('returns CEO contract inclusions when role header is ceo', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/context',
      headers: {
        'x-tenant-id': 'sollu',
        'x-role': 'ceo'
      }
    });

    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(payload.contract.role).toBe('ceo');
    expect(payload.contract.sections.map((s) => s.id)).toContain('analytics');
  });

  it('limits the commercial contract to CRM and billing', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/context',
      headers: {
        'x-tenant-id': 'sollu',
        'x-role': 'commercial'
      }
    });
    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(payload.contract.role).toBe('commercial');
    expect(payload.contract.sections.map((section) => section.id)).toContain('crm');
    expect(payload.contract.sections.map((section) => section.id)).toContain('billing');
    expect(payload.contract.sections.map((section) => section.id)).not.toContain('analytics');
  });

  it('requires tenant header even if no payload is provided', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/v1/dashboard/context' });
    expect(response.statusCode).toBe(401);
  });
});
