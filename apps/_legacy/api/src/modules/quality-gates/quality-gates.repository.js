import { randomUUID } from 'node:crypto';

export class QualityGatesRepository {
  constructor() {
    this.gatesByTenant = new Map();
    this.decisionsByTenant = new Map();
  }

  ensureTenant(tenantId) {
    if (!this.gatesByTenant.has(tenantId)) {
      this.gatesByTenant.set(tenantId, []);
    }
    if (!this.decisionsByTenant.has(tenantId)) {
      this.decisionsByTenant.set(tenantId, []);
    }
  }

  createGate({ tenantId, flowName, stepName, reason }) {
    this.ensureTenant(tenantId);
    const gate = {
      id: randomUUID(),
      tenantId,
      flowName,
      stepName,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.gatesByTenant.get(tenantId).push(gate);
    return gate;
  }

  listPending(tenantId) {
    this.ensureTenant(tenantId);
    return this.gatesByTenant.get(tenantId).filter((item) => item.status === 'pending');
  }

  updateGateStatus({ tenantId, gateId, status }) {
    this.ensureTenant(tenantId);
    const gate = this.gatesByTenant.get(tenantId).find((item) => item.id === gateId);
    if (!gate) {
      return null;
    }
    gate.status = status;
    gate.updatedAt = new Date().toISOString();
    return gate;
  }

  addDecision({ tenantId, gateId, actor, decision, justification }) {
    this.ensureTenant(tenantId);
    const entry = {
      id: randomUUID(),
      tenantId,
      gateId,
      actor,
      decision,
      justification,
      createdAt: new Date().toISOString()
    };
    this.decisionsByTenant.get(tenantId).push(entry);
    return entry;
  }

  listDecisions(tenantId) {
    this.ensureTenant(tenantId);
    return this.decisionsByTenant.get(tenantId);
  }
}

