import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildApp } from '../src/app.js';

describe('AMP213 events calendar', () => {
  let app;

  beforeEach(async () => {
    app = buildApp();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists events by tenant and date range', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        title: 'Casamento A',
        venue: 'Sala 1',
        startsAt: '2026-04-10T18:00:00.000Z',
        endsAt: '2026-04-10T22:00:00.000Z',
        status: 'confirmed'
      }
    });

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/events?tenantId=amp213&from=2026-04-01T00:00:00.000Z&to=2026-04-30T23:59:59.000Z',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(list.statusCode).toBe(200);
    expect(list.json().items).toHaveLength(1);
    expect(list.json().items[0].title).toBe('Casamento A');
  });

  it('marks conflicts for overlapping events in same venue', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        title: 'Evento 1',
        venue: 'Sala X',
        startsAt: '2026-05-01T19:00:00.000Z',
        endsAt: '2026-05-01T21:00:00.000Z'
      }
    });
    await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        title: 'Evento 2',
        venue: 'Sala X',
        startsAt: '2026-05-01T20:00:00.000Z',
        endsAt: '2026-05-01T23:00:00.000Z'
      }
    });

    const list = await app.inject({
      method: 'GET',
      url: '/api/v1/events?tenantId=amp213',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(list.statusCode).toBe(200);
    expect(list.json().items).toHaveLength(2);
    expect(list.json().items.every((item) => item.hasConflict)).toBe(true);
  });

  it('updates event and writes audit record', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/events',
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        title: 'Corporativo Y',
        venue: 'Sala C',
        startsAt: '2026-06-01T14:00:00.000Z',
        endsAt: '2026-06-01T18:00:00.000Z',
        status: 'planned'
      }
    });

    const event = created.json();

    const updated = await app.inject({
      method: 'PUT',
      url: `/api/v1/events/${event.id}`,
      headers: { 'x-tenant-id': 'amp213' },
      payload: {
        tenantId: 'amp213',
        updates: { status: 'confirmed' }
      }
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.json().status).toBe('confirmed');

    const audit = await app.inject({
      method: 'GET',
      url: '/api/v1/events/audit?tenantId=amp213',
      headers: { 'x-tenant-id': 'amp213' }
    });

    expect(audit.statusCode).toBe(200);
    expect(audit.json().items).toHaveLength(1);
    expect(audit.json().items[0].action).toBe('event.updated');
  });
});
