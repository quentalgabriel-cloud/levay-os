export class QualityGatesService {
  constructor(repository) {
    this.repository = repository;
  }

  createGate(payload) {
    return this.repository.createGate(payload);
  }

  listPending(tenantId) {
    return this.repository.listPending(tenantId);
  }

  decideGate({ tenantId, gateId, actor, decision, justification }) {
    if (!actor || !justification) {
      return { ok: false, reason: 'actor_and_justification_required' };
    }
    if (!['approved', 'rejected'].includes(decision)) {
      return { ok: false, reason: 'invalid_decision' };
    }

    const updated = this.repository.updateGateStatus({
      tenantId,
      gateId,
      status: decision
    });

    if (!updated) {
      return { ok: false, reason: 'gate_not_found' };
    }

    const audit = this.repository.addDecision({
      tenantId,
      gateId,
      actor,
      decision,
      justification
    });

    return { ok: true, gate: updated, audit };
  }

  listDecisions(tenantId) {
    return this.repository.listDecisions(tenantId);
  }
}

