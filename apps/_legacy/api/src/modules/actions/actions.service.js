export class ActionsService {
  constructor({ crmService, billingService, qualityGatesService, operationsService }) {
    this.crmService = crmService;
    this.billingService = billingService;
    this.qualityGatesService = qualityGatesService;
    this.operationsService = operationsService;
    this.rolePolicy = {
      'crm.advance-proposal': ['commercial', 'operations'],
      'billing.collect': ['commercial', 'operations', 'financeiro'],
      'gates.approve': ['operations', 'ceo'],
      'gates.reject': ['operations', 'ceo'],
      'crm.bulk.advance.proposal': ['commercial', 'operations'],
      'billing.bulk.collect.pending': ['commercial', 'operations', 'financeiro'],
      'gates.bulk.approve.pending': ['operations', 'ceo']
    };
  }

  publishEvent({ tenantId, actionId, status, actorType, role, payload = {}, type }) {
    if (!this.operationsService) return;
    this.operationsService.publish({
      tenantId,
      type,
      flow: 'ui.intent',
      status,
      actorType,
      payload: {
        actionId,
        role,
        ...payload
      }
    });
  }

  handleIntent({ tenantId, actionId, payload = {}, actor, role, actorType = 'human' }) {
    if (!tenantId || !actionId) {
      return { ok: false, reason: 'tenant_and_action_required' };
    }
    if (!role) {
      return { ok: false, reason: 'role_required' };
    }
    const allowedRoles = this.rolePolicy[actionId];
    if (allowedRoles && !allowedRoles.includes(role)) {
      return { ok: false, reason: 'forbidden' };
    }

    this.publishEvent({
      tenantId,
      actionId,
      status: 'success',
      actorType,
      role,
      payload,
      type: 'action.intent.received'
    });

    try {
      if (actionId === 'crm.advance-proposal') {
        const leadId = payload.leadId;
        if (!leadId) return { ok: false, reason: 'lead_id_required' };
        const updated = this.crmService.updateLeadStage({
          tenantId,
          leadId,
          stageId: 'proposal',
          actor
        });
        if (!updated) return { ok: false, reason: 'lead_not_found' };
        this.publishEvent({
          tenantId,
          actionId,
          status: 'success',
          actorType,
          role,
          payload: { leadId },
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result: updated };
      }

      if (actionId === 'billing.collect') {
        const receivableId = payload.receivableId;
        if (!receivableId) return { ok: false, reason: 'receivable_id_required' };
        const result = this.billingService.triggerCollection({
          tenantId,
          receivableId,
          channel: payload.channel || 'whatsapp'
        });
        if (!result) return { ok: false, reason: 'receivable_not_found' };
        this.publishEvent({
          tenantId,
          actionId,
          status: 'success',
          actorType,
          role,
          payload: { receivableId },
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result };
      }

      if (actionId === 'gates.approve' || actionId === 'gates.reject') {
        const gateId = payload.gateId;
        const justification = payload.justification;
        if (!gateId) return { ok: false, reason: 'gate_id_required' };
        if (!justification) return { ok: false, reason: 'justification_required' };
        const decision = actionId === 'gates.approve' ? 'approved' : 'rejected';
        const result = this.qualityGatesService.decideGate({
          tenantId,
          gateId,
          actor,
          decision,
          justification
        });
        if (!result.ok) return { ok: false, reason: result.reason || 'gate_decision_failed' };
        this.publishEvent({
          tenantId,
          actionId,
          status: 'success',
          actorType,
          role,
          payload: { gateId, decision },
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result };
      }

      if (actionId === 'crm.bulk.advance.proposal') {
        const leads = this.crmService.listLeads(tenantId).filter((lead) => lead.stageId !== 'proposal');
        let processed = 0;
        let failed = 0;
        leads.forEach((lead) => {
          const updated = this.crmService.updateLeadStage({
            tenantId,
            leadId: lead.id,
            stageId: 'proposal',
            actor
          });
          if (updated) processed += 1;
          else failed += 1;
        });
        const result = { processed, failed, totalCandidates: leads.length };
        this.publishEvent({
          tenantId,
          actionId,
          status: failed > 0 ? 'retry' : 'success',
          actorType,
          role,
          payload: result,
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result };
      }

      if (actionId === 'billing.bulk.collect.pending') {
        const receivables = this.billingService
          .listReceivables(tenantId)
          .filter((item) => item.status === 'pending');
        let processed = 0;
        let failed = 0;
        receivables.forEach((receivable) => {
          const result = this.billingService.triggerCollection({
            tenantId,
            receivableId: receivable.id,
            channel: payload.channel || 'whatsapp'
          });
          if (result) processed += 1;
          else failed += 1;
        });
        const result = { processed, failed, totalPending: receivables.length };
        this.publishEvent({
          tenantId,
          actionId,
          status: failed > 0 ? 'retry' : 'success',
          actorType,
          role,
          payload: result,
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result };
      }

      if (actionId === 'gates.bulk.approve.pending') {
        const gates = this.qualityGatesService.listPending(tenantId);
        let processed = 0;
        let failed = 0;
        gates.forEach((gate) => {
          const result = this.qualityGatesService.decideGate({
            tenantId,
            gateId: gate.id,
            actor,
            decision: 'approved',
            justification: payload.justification || 'aprovado em lote pelo painel operacional'
          });
          if (result.ok) processed += 1;
          else failed += 1;
        });
        const result = { processed, failed, totalPending: gates.length };
        this.publishEvent({
          tenantId,
          actionId,
          status: failed > 0 ? 'retry' : 'success',
          actorType,
          role,
          payload: result,
          type: 'action.intent.executed'
        });
        return { ok: true, status: 'executed', actionId, result };
      }

      return { ok: false, reason: 'unknown_action' };
    } catch (error) {
      this.publishEvent({
        tenantId,
        actionId,
        status: 'dead-letter',
        actorType,
        role,
        payload: { message: error?.message || 'intent_failed' },
        type: 'action.intent.failed'
      });
      return { ok: false, reason: 'intent_failed' };
    }
  }
}
