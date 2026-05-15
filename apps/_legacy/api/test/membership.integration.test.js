import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('BICA CLUB membership', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates members with status, tier and validity', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/membership/members',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        name: 'Membro A',
        tier: 'gold',
        validUntil: '2026-12-31',
        actor: 'manager'
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().status).toBe('active');
    expect(response.json().tier).toBe('gold');
  });

  it('checks benefit eligibility and supports renew/expire/cancel lifecycle', async () => {
    const member = await app.inject({
      method: 'POST',
      url: '/api/v1/membership/members',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        name: 'Membro B',
        tier: 'platinum',
        validUntil: '2026-06-30'
      }
    });

    const benefit = await app.inject({
      method: 'POST',
      url: '/api/v1/membership/benefits',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        name: 'Reserva Prioritaria',
        eligibleTiers: ['platinum']
      }
    });

    const eligibility = await app.inject({
      method: 'POST',
      url: '/api/v1/membership/eligibility',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        memberId: member.json().id,
        benefitId: benefit.json().id
      }
    });

    expect(eligibility.statusCode).toBe(200);
    expect(eligibility.json().eligible).toBe(true);

    const renew = await app.inject({
      method: 'POST',
      url: `/api/v1/membership/members/${member.json().id}/renew`,
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        validUntil: '2027-06-30'
      }
    });
    expect(renew.statusCode).toBe(200);

    const expire = await app.inject({
      method: 'POST',
      url: `/api/v1/membership/members/${member.json().id}/expire`,
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica' }
    });
    expect(expire.json().status).toBe('expired');

    const cancel = await app.inject({
      method: 'POST',
      url: `/api/v1/membership/members/${member.json().id}/cancel`,
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica' }
    });
    expect(cancel.json().status).toBe('cancelled');
  });

  it('returns operational view and audit trail', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/membership/members',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        name: 'Membro C',
        tier: 'silver',
        validUntil: '2026-03-22',
        actor: 'operator'
      }
    });

    const view = await app.inject({
      method: 'GET',
      url: '/api/v1/membership/operational-view?tenantId=bica',
      headers: { 'x-tenant-id': 'bica' }
    });

    expect(view.statusCode).toBe(200);
    expect(view.json().all.length).toBeGreaterThan(0);

    const audit = await app.inject({
      method: 'GET',
      url: '/api/v1/membership/audit?tenantId=bica',
      headers: { 'x-tenant-id': 'bica' }
    });

    expect(audit.statusCode).toBe(200);
    expect(audit.json().items.length).toBeGreaterThan(0);
  });
});
