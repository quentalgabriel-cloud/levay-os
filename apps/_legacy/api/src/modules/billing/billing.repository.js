import { randomUUID } from 'node:crypto';

export class BillingRepository {
  constructor() {
    this.receivablesByTenant = new Map();
    this.eventsByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.receivablesByTenant.has(tenantId)) {
      this.receivablesByTenant.set(tenantId, []);
    }
    if (!this.eventsByTenant.has(tenantId)) {
      this.eventsByTenant.set(tenantId, []);
    }
  }

  createReceivable({ tenantId, customerName, amount, dueDate }) {
    this.ensureTenant(tenantId);
    const receivable = {
      id: randomUUID(),
      tenantId,
      customerName,
      amount,
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.receivablesByTenant.get(tenantId).push(receivable);
    return receivable;
  }

  listReceivables(tenantId) {
    this.ensureTenant(tenantId);
    return this.receivablesByTenant.get(tenantId);
  }

  findReceivable(tenantId, receivableId) {
    this.ensureTenant(tenantId);
    return this.receivablesByTenant.get(tenantId).find((item) => item.id === receivableId) || null;
  }

  updateReceivableStatus({ tenantId, receivableId, status }) {
    const receivable = this.findReceivable(tenantId, receivableId);
    if (!receivable) {
      return null;
    }

    receivable.status = status;
    receivable.updatedAt = new Date().toISOString();
    return receivable;
  }

  addBillingEvent({ tenantId, receivableId, type, status, metadata = {} }) {
    this.ensureTenant(tenantId);
    const event = {
      id: randomUUID(),
      tenantId,
      receivableId,
      type,
      status,
      metadata,
      createdAt: new Date().toISOString()
    };
    this.eventsByTenant.get(tenantId).push(event);
    return event;
  }

  listBillingEvents(tenantId) {
    this.ensureTenant(tenantId);
    return this.eventsByTenant.get(tenantId);
  }
}

