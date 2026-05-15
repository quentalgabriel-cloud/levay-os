import { randomUUID } from 'node:crypto';

export class ContractsRepository {
  constructor() {
    this.contractsByTenant = new Map();
    this.auditByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.contractsByTenant.has(tenantId)) {
      this.contractsByTenant.set(tenantId, []);
    }
    if (!this.auditByTenant.has(tenantId)) {
      this.auditByTenant.set(tenantId, []);
    }
  }

  saveContractMetadata({ tenantId, customerName, fileId, fileUrl, provider }) {
    this.ensureTenant(tenantId);
    const item = {
      id: randomUUID(),
      tenantId,
      customerName,
      fileId,
      fileUrl,
      provider,
      createdAt: new Date().toISOString()
    };
    this.contractsByTenant.get(tenantId).push(item);
    return item;
  }

  listContracts(tenantId) {
    this.ensureTenant(tenantId);
    return this.contractsByTenant.get(tenantId);
  }

  addAudit({ tenantId, type, message, metadata = {} }) {
    this.ensureTenant(tenantId);
    const entry = {
      id: randomUUID(),
      tenantId,
      type,
      message,
      metadata,
      createdAt: new Date().toISOString()
    };
    this.auditByTenant.get(tenantId).push(entry);
    return entry;
  }

  listAudit(tenantId) {
    this.ensureTenant(tenantId);
    return this.auditByTenant.get(tenantId);
  }
}

