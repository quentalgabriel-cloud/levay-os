import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('CRM Sollu', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates and lists leads for tenant', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead A',
        nextFollowUpAt: '2026-03-20T12:00:00.000Z'
      }
    });

    expect(created.statusCode).toBe(201);

    const listed = await app.inject({
      method: 'GET',
      url: '/api/v1/crm/leads?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(listed.statusCode).toBe(200);
    const body = listed.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].interactions).toBeDefined();
    expect(body.items[0].nextFollowUpAt).toBe('2026-03-20T12:00:00.000Z');
  });

  it('moves lead stage and writes audit event', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/crm/pipeline/stages',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        stageName: 'Fechamento'
      }
    });

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead B'
      }
    });

    const lead = created.json();

    const moved = await app.inject({
      method: 'PUT',
      url: `/api/v1/crm/leads/${lead.id}/stage`,
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        stageId: 'fechamento',
        actor: 'seller-user'
      }
    });

    expect(moved.statusCode).toBe(200);
    expect(moved.json().stageId).toBe('fechamento');

    const audit = await app.inject({
      method: 'GET',
      url: '/api/v1/crm/audit-events?tenantId=sollu',
      headers: { 'x-tenant-id': 'sollu' }
    });

    expect(audit.statusCode).toBe(200);
    expect(audit.json().items).toHaveLength(1);
    expect(audit.json().items[0].type).toBe('lead.stage.changed');
    expect(audit.json().items[0].fromStageId).toBe('new');
    expect(audit.json().items[0].toStageId).toBe('fechamento');
  });

  it('enforces tenant filter and prevents cross-tenant access', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead C'
      }
    });

    const lead = created.json();

    const listOtherTenant = await app.inject({
      method: 'GET',
      url: '/api/v1/crm/leads?tenantId=amp213',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(listOtherTenant.statusCode).toBe(200);
    expect(listOtherTenant.json().items).toHaveLength(0);

    const moveFromOtherTenant = await app.inject({
      method: 'PUT',
      url: `/api/v1/crm/leads/${lead.id}/stage`,
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        stageId: 'proposal'
      }
    });

    expect(moveFromOtherTenant.statusCode).toBe(404);
  });

  it('advances non-proposal leads in bulk', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead Bulk A'
      }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        name: 'Lead Bulk B',
        stageId: 'proposal'
      }
    });

    const bulk = await app.inject({
      method: 'POST',
      url: '/api/v1/crm/leads/advance-proposal',
      headers: { 'x-tenant-id': 'sollu' },
      payload: {
        tenantId: 'sollu',
        actor: 'bulk-user'
      }
    });

    expect(bulk.statusCode).toBe(200);
    expect(bulk.json().processed).toBe(1);
    expect(bulk.json().totalCandidates).toBe(1);
  });
});
