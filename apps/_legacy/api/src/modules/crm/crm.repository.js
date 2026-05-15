import { randomUUID } from 'node:crypto';

export class CrmRepository {
  constructor() {
    this.pipelinesByTenant = new Map();
    this.leadsByTenant = new Map();
    this.auditEvents = [];
  }

  ensureTenant(tenantId) {
    if (!this.pipelinesByTenant.has(tenantId)) {
      this.pipelinesByTenant.set(tenantId, [
        { id: 'new', name: 'Novo Lead', order: 1 },
        { id: 'contacted', name: 'Contactado', order: 2 },
        { id: 'proposal', name: 'Proposta', order: 3 }
      ]);
    }

    if (!this.leadsByTenant.has(tenantId)) {
      this.leadsByTenant.set(tenantId, []);
    }
  }

  listPipeline(tenantId) {
    this.ensureTenant(tenantId);
    return this.pipelinesByTenant.get(tenantId);
  }

  addStage(tenantId, stageName) {
    this.ensureTenant(tenantId);
    const stages = this.pipelinesByTenant.get(tenantId);
    const stage = {
      id: stageName.toLowerCase().replace(/\s+/g, '-'),
      name: stageName,
      order: stages.length + 1
    };
    stages.push(stage);
    return stage;
  }

  createLead({ tenantId, name, stageId, nextFollowUpAt }) {
    this.ensureTenant(tenantId);

    const stages = this.pipelinesByTenant.get(tenantId);
    const selectedStage = stages.find((item) => item.id === stageId) || stages[0];

    const lead = {
      id: randomUUID(),
      tenantId,
      name,
      stageId: selectedStage.id,
      interactions: [],
      nextFollowUpAt: nextFollowUpAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.leadsByTenant.get(tenantId).push(lead);
    return lead;
  }

  listLeads(tenantId) {
    this.ensureTenant(tenantId);
    return this.leadsByTenant.get(tenantId);
  }

  updateLeadStage({ tenantId, leadId, stageId }) {
    this.ensureTenant(tenantId);

    const stages = this.pipelinesByTenant.get(tenantId);
    const stageExists = stages.some((stage) => stage.id === stageId);
    if (!stageExists) {
      return null;
    }

    const leads = this.leadsByTenant.get(tenantId);
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) {
      return null;
    }

    lead.stageId = stageId;
    lead.updatedAt = new Date().toISOString();
    return lead;
  }

  addAuditEvent(event) {
    this.auditEvents.push(event);
    return event;
  }

  listAuditEvents(tenantId) {
    return this.auditEvents.filter((event) => event.tenantId === tenantId);
  }
}
