import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Bica reservations and waitlist', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('enforces max capacity of 70 seats', async () => {
    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/reservations',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        guestName: 'Grupo A',
        seats: 60
      }
    });
    expect(first.statusCode).toBe(201);

    const second = await app.inject({
      method: 'POST',
      url: '/api/v1/reservations',
      headers: { 'x-tenant-id': 'bica' },
      payload: {
        tenantId: 'bica',
        guestName: 'Grupo B',
        seats: 15
      }
    });
    expect(second.statusCode).toBe(409);
  });

  it('promotes waitlist automatically by priority', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/reservations/waitlist',
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica', guestName: 'Cliente 1', seats: 2, priority: 1 }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/reservations/waitlist',
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica', guestName: 'VIP', seats: 2, priority: 5 }
    });

    const promoted = await app.inject({
      method: 'POST',
      url: '/api/v1/reservations/waitlist/promote',
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica' }
    });

    expect(promoted.statusCode).toBe(201);
    expect(promoted.json().guestName).toBe('VIP');
  });

  it('handles table state transitions and tenant isolation', async () => {
    const createdTable = await app.inject({
      method: 'POST',
      url: '/api/v1/reservations/tables',
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica', label: 'Mesa 1', capacity: 4 }
    });

    const table = createdTable.json();

    const updated = await app.inject({
      method: 'PATCH',
      url: `/api/v1/reservations/tables/${table.id}/status`,
      headers: { 'x-tenant-id': 'bica' },
      payload: { tenantId: 'bica', status: 'ocupada' }
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.json().status).toBe('ocupada');

    const wrongTenant = await app.inject({
      method: 'PATCH',
      url: `/api/v1/reservations/tables/${table.id}/status`,
      headers: { 'x-tenant-id': 'amp213' },
      payload: { tenantId: 'amp213', status: 'livre' }
    });

    expect(wrongTenant.statusCode).toBe(404);
  });
});
