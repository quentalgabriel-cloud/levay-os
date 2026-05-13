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

  trackAuth({ tenantId, action, userId, email, ip, userAgent }) {
    return this.repository.addAuditEvent({
      id: randomUUID(),
      tenantId,
      type: `auth.${action}`,
      userId,
      actor: email || userId,
      details: { ip, userAgent },
      createdAt: new Date().toISOString()
    });
  }

  trackEntityChange({ tenantId, entityType, entityId, action, actor, before, after }) {
    return this.repository.addAuditEvent({
      id: randomUUID(),
      tenantId,
      type: `${entityType}.${action}`,
      entityId,
      actor,
      before,
      after,
      createdAt: new Date().toISOString()
    });
  }

  listEvents({ tenantId, type, actor, since, until, limit = 100 }) {
    return this.repository.listEvents({ tenantId, type, actor, since, until, limit });
  }

  getEventTypes() {
    return [
      'auth.login',
      'auth.logout',
      'task.created',
      'task.updated',
      'task.deleted',
      'project.created',
      'project.updated',
      'project.deleted',
      'decision.created',
      'decision.updated',
      'decision.deleted',
      'lead.stage.changed',
      'lead.created',
      'billing.event',
      'quality-gate.approved',
      'quality-gate.rejected'
    ];
  }

  applyRetentionPolicy({ tenantId, retentionDays = 365 }) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);
    return this.repository.archiveOldEvents({ tenantId, cutoff: cutoff.toISOString() });
  }
}
