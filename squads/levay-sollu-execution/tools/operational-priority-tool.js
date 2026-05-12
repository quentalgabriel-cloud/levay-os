/**
 * Operational Priority Tool
 *
 * Calcula prioridade operacional para filas da Sollu com base em volume e severidade.
 */

function normalizeCount(value) {
  const n = Number(value || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function computeQueueRisk({ pendingReceivables = 0, pendingGates = 0, stalledLeads = 0 } = {}) {
  const receivables = normalizeCount(pendingReceivables);
  const gates = normalizeCount(pendingGates);
  const leads = normalizeCount(stalledLeads);

  // Peso maior para gates (bloqueio de fluxo) e recebiveis (impacto financeiro direto).
  const score = receivables * 2 + gates * 3 + leads * 1.5;
  const normalized = clamp(Math.round(score), 0, 100);

  let severity = 'low';
  if (normalized >= 60) {
    severity = 'critical';
  } else if (normalized >= 35) {
    severity = 'high';
  } else if (normalized >= 15) {
    severity = 'medium';
  }

  return {
    score: normalized,
    severity,
    inputs: { pendingReceivables: receivables, pendingGates: gates, stalledLeads: leads }
  };
}

function rankOperationalActions({ pendingReceivables = 0, pendingGates = 0, stalledLeads = 0 } = {}) {
  const rows = [
    {
      id: 'billing.bulk.collect.pending',
      label: 'Cobrar recebiveis pendentes',
      effort: 1,
      impact: normalizeCount(pendingReceivables) * 2
    },
    {
      id: 'gates.bulk.approve.pending',
      label: 'Aprovar quality gates pendentes',
      effort: 1,
      impact: normalizeCount(pendingGates) * 3
    },
    {
      id: 'crm.bulk.advance.proposal',
      label: 'Avancar leads para proposta',
      effort: 1,
      impact: normalizeCount(stalledLeads) * 1.5
    }
  ];

  return rows
    .map((row) => ({
      ...row,
      priorityScore: Math.round(row.impact / row.effort)
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore || a.id.localeCompare(b.id));
}

module.exports = {
  computeQueueRisk,
  rankOperationalActions
};
