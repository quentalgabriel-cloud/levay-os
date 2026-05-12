export class CrmService {
  constructor(repository, auditService) {
    this.repository = repository;
    this.auditService = auditService;
  }

  listPipeline(tenantId) {
    return this.repository.listPipeline(tenantId);
  }

  addStage(tenantId, stageName) {
    return this.repository.addStage(tenantId, stageName);
  }

  createLead(payload) {
    return this.repository.createLead(payload);
  }

  listLeads(tenantId) {
    return this.repository.listLeads(tenantId);
  }

  updateLeadStage({ tenantId, leadId, stageId, actor }) {
    const currentLead = this.repository.listLeads(tenantId).find((item) => item.id === leadId);
    if (!currentLead) {
      return null;
    }
    const previousStageId = currentLead.stageId;

    const updated = this.repository.updateLeadStage({ tenantId, leadId, stageId });
    if (!updated) {
      return null;
    }

    this.auditService.trackStageChange({
      tenantId,
      leadId,
      fromStageId: previousStageId,
      toStageId: stageId,
      actor
    });

    return updated;
  }

  listAuditEvents(tenantId) {
    return this.repository.listAuditEvents(tenantId);
  }
}
