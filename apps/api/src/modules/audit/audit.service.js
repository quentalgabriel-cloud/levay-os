import { randomUUID } from 'node:crypto';

export class AuditService {
  constructor(repository) {
    this.repository = repository;
  }

  trackStageChange({ tenantId, leadId, fromStageId, toStageId, actor = 'system' }) {
    return this.repository.addAuditEvent({
      id: randomUUID(),
      tenantId,
      leadId,
      type: 'lead.stage.changed',
      fromStageId,
      toStageId,
      actor,
      createdAt: new Date().toISOString()
    });
  }
}
