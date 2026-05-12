import { randomUUID } from 'node:crypto';

export class EventsRepository {
  constructor() {
    this.eventsByTenant = new Map();
    this.auditByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.eventsByTenant.has(tenantId)) {
      this.eventsByTenant.set(tenantId, []);
    }
    if (!this.auditByTenant.has(tenantId)) {
      this.auditByTenant.set(tenantId, []);
    }
  }

  createEvent({ tenantId, title, venue, startsAt, endsAt, status = 'planned' }) {
    this.ensureTenant(tenantId);
    const event = {
      id: randomUUID(),
      tenantId,
      title,
      venue,
      startsAt,
      endsAt,
      status,
      hasConflict: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.eventsByTenant.get(tenantId).push(event);
    return event;
  }

  listEvents(tenantId) {
    this.ensureTenant(tenantId);
    return this.eventsByTenant.get(tenantId);
  }

  updateEvent({ tenantId, eventId, updates }) {
    const event = this.listEvents(tenantId).find((item) => item.id === eventId);
    if (!event) {
      return null;
    }

    Object.assign(event, updates);
    event.updatedAt = new Date().toISOString();
    return event;
  }

  addAudit({ tenantId, eventId, action, metadata }) {
    this.ensureTenant(tenantId);
    this.auditByTenant.get(tenantId).push({
      id: randomUUID(),
      tenantId,
      eventId,
      action,
      metadata,
      createdAt: new Date().toISOString()
    });
  }

  listAudit(tenantId) {
    this.ensureTenant(tenantId);
    return this.auditByTenant.get(tenantId);
  }
}

