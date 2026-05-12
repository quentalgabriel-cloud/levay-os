import { describe, it, expect } from 'vitest';
import { buildAppOverviewModel } from '../src/modules/app/app-overview-model.js';
import { buildDashboardContract } from '../../api/src/modules/dashboard/dashboard.config.js';

describe('dashboard view smoke scenarios', () => {
  const snapshotTemplate = () => ({
    crm: { status: 'fulfilled', value: { items: [] } },
    billing: { status: 'fulfilled', value: { items: [] } },
    events: { status: 'fulfilled', value: { items: [] } },
    reservations: { status: 'fulfilled', value: { items: [] } },
    membership: { status: 'fulfilled', value: {} },
    qualityGates: { status: 'fulfilled', value: { items: [] } },
    contracts: { status: 'fulfilled', value: { items: [] } },
    analytics: { status: 'fulfilled', value: { consolidated: {} } },
    operations: { status: 'fulfilled', value: { total: 0, breakdownByType: [] } },
    operationsEvents: { status: 'fulfilled', value: { items: [] } },
    recommendationEvents: { status: 'fulfilled', value: { items: [] } }
  });

  const verifyContext = (role, expectedSections = []) => {
    const contract = buildDashboardContract(role);
    const model = buildAppOverviewModel(snapshotTemplate(), { tenantId: 'sollu', role, contract });
    const sectionIds = model.sections.map((section) => section.id);
    expect(model.contract.role).toBe(contract.role);
    expect(sectionIds).toEqual(expectedSections);
    expect(model.cards.every((card) => contract.cards.some((allowed) => allowed.id === card.id))).toBe(true);
  };

  it('CEO sees analytics + consolidated sections', () => {
    verifyContext('ceo', [
      'priorities',
      'operations',
      'operations-timeline',
      'recommendation-efficiency',
      'quality-gates',
      'analytics'
    ]);
  });

  it('Comercial tem CRM + billing prioritizados sem analytics', () => {
    verifyContext('commercial', [
      'priorities',
      'crm',
      'billing',
      'quality-gates',
      'operations',
      'operations-timeline',
      'recommendation-efficiency',
      'contracts'
    ]);
  });

  it('Operacoes vê Quality Gates, reservas e eventos', () => {
    verifyContext('operations', [
      'priorities',
      'operations',
      'operations-timeline',
      'recommendation-efficiency',
      'quality-gates',
      'contracts',
      'reservations',
      'membership',
      'events'
    ]);
  });
});
