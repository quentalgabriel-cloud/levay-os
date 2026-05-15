export class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
    this.crmService = null;
    this.billingService = null;
    this.reservationsService = null;
    this.eventsService = null;
  }

  setServices({ crmService, billingService, reservationsService, eventsService }) {
    this.crmService = crmService;
    this.billingService = billingService;
    this.reservationsService = reservationsService;
    this.eventsService = eventsService;
  }

  ingest(record) {
    this.repository.addRecord(record);
  }

  async getExecutiveKpis({ tenantId, from, to, role = 'operator' }) {
    const isCeo = role === 'ceo';
    const targetTenants = isCeo ? ['sollu', 'bicabar', 'amp213'] : [tenantId];

    const [analyticsRows, crmData, billingData, reservationsData, eventsData] = await Promise.all([
      this._getAnalyticsData(targetTenants, from, to),
      this._getCrmData(targetTenants),
      this._getBillingData(targetTenants),
      this._getReservationsData(targetTenants),
      this._getEventsData(targetTenants)
    ]);

    const byTenant = {};
    for (const t of targetTenants) {
      byTenant[t] = {
        revenue: billingData[t] || { total: 0, pending: 0, paid: 0, overdue: 0 },
        leads: crmData[t] || { total: 0, novo: 0, qualificado: 0, negociando: 0, ganho: 0 },
        occupancy: this._calculateOccupancy(reservationsData[t], eventsData[t]),
        analytics: analyticsRows[t] || { revenue: 0, conversion: 0, efficiency: 0 }
      };
    }

    const consolidated = this._consolidateData(byTenant);
    const insights = this._generateInsights(byTenant, consolidated);

    const tenantsWithData = Object.entries(byTenant).filter(([_, v]) => 
      v.analytics.revenue > 0 || v.revenue.total > 0 || v.leads.total > 0
    );
    const tenantsArray = tenantsWithData.map(([key, value]) => ({
      tenantId: key,
      ...value.revenue,
      leads: value.leads,
      occupancy: value.occupancy,
      analytics: value.analytics
    }));

    return {
      tenants: tenantsArray,
      consolidated,
      insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        tenantsIncluded: targetTenants,
        role
      }
    };
  }

  async _getAnalyticsData(tenants, from, to) {
    const result = {};
    for (const tenantId of tenants) {
      const rows = this.repository.query({ tenantId, from, to });
      if (rows.length > 0) {
        const totalRevenue = rows.reduce((sum, r) => sum + (r.revenue || 0), 0);
        const avgConversion = rows.reduce((sum, r) => sum + (r.conversion || 0), 0) / rows.length;
        const avgEfficiency = rows.reduce((sum, r) => sum + (r.efficiency || 0), 0) / rows.length;
        result[tenantId] = { revenue: totalRevenue, conversion: avgConversion, efficiency: avgEfficiency };
      }
    }
    return result;
  }

  async _getCrmData(tenants) {
    const result = {};
    if (!this.crmService) return result;
    for (const tenantId of tenants) {
      const leads = this.crmService.listLeads(tenantId);
      result[tenantId] = {
        total: leads.length,
        novo: leads.filter(l => l.stageId === 'new').length,
        qualificado: leads.filter(l => l.stageId === 'proposal').length,
        negociando: leads.filter(l => l.stageId === 'contacted').length,
        ganho: leads.filter(l => l.stageId === 'won').length
      };
    }
    return result;
  }

  async _getBillingData(tenants) {
    const result = {};
    if (!this.billingService) return result;
    for (const tenantId of tenants) {
      const receivables = this.billingService.listReceivables(tenantId);
      const total = receivables.reduce((sum, r) => sum + (r.amount || 0), 0);
      const pending = receivables.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + (r.amount || 0), 0);
      const paid = receivables.filter(r => r.status === 'PAID').reduce((sum, r) => sum + (r.amount || 0), 0);
      const overdue = receivables.filter(r => r.status === 'OVERDUE').reduce((sum, r) => sum + (r.amount || 0), 0);
      result[tenantId] = { total, pending, paid, overdue };
    }
    return result;
  }

  async _getReservationsData(tenants) {
    const result = {};
    if (!this.reservationsService) return result;
    for (const tenantId of tenants) {
      const reservations = this.reservationsService.listReservations(tenantId);
      const total = reservations.length;
      const confirmed = reservations.filter(r => r.status === 'CONFIRMED').length;
      const pending = reservations.filter(r => r.status === 'PENDING').length;
      result[tenantId] = { total, confirmed, pending };
    }
    return result;
  }

  async _getEventsData(tenants) {
    const result = {};
    if (!this.eventsService) return result;
    for (const tenantId of tenants) {
      const events = this.eventsService.listEvents(tenantId);
      const total = events.length;
      const upcoming = events.filter(e => new Date(e.date) > new Date()).length;
      result[tenantId] = { total, upcoming };
    }
    return result;
  }

  _calculateOccupancy(reservations, events) {
    const resTotal = reservations?.total || 0;
    const resConfirmed = reservations?.confirmed || 0;
    const evtTotal = events?.total || 0;
    const combined = resTotal + evtTotal;
    return combined > 0 ? ((resConfirmed / combined) * 100).toFixed(1) : 0;
  }

  _consolidateData(byTenant) {
    const analyticsRevenue = Object.values(byTenant).reduce((sum, t) => sum + (t.analytics?.revenue || 0), 0);
    const billingTotal = Object.values(byTenant).reduce((sum, t) => sum + t.revenue.total, 0);
    const pending = Object.values(byTenant).reduce((sum, t) => sum + t.revenue.pending, 0);
    const overdue = Object.values(byTenant).reduce((sum, t) => sum + t.revenue.overdue, 0);
    const leadsTotal = Object.values(byTenant).reduce((sum, t) => sum + t.leads.total, 0);
    const leadsGanho = Object.values(byTenant).reduce((sum, t) => sum + t.leads.ganho, 0);
    const occupancy = Object.values(byTenant).reduce((sum, t) => sum + parseFloat(t.occupancy || 0), 0) / Object.keys(byTenant).length;
    
    return {
      revenue: analyticsRevenue,
      revenueDetails: { total: billingTotal, pending, overdue },
      leads: { total: leadsTotal, ganho: leadsGanho, conversion: leadsTotal > 0 ? ((leadsGanho / leadsTotal) * 100).toFixed(1) : 0 },
      occupancy: occupancy.toFixed(1)
    };
  }

  _generateInsights(byTenant, consolidated) {
    const insights = [];
    
    if (consolidated.revenue.overdue > 0) {
      insights.push({ type: 'alert', severity: 'high', message: `R$ ${consolidated.revenue.overdue.toLocaleString('pt-BR')} em recebíveis vencidos` });
    }
    
    if (consolidated.revenue.pending > consolidated.revenue.total * 0.5) {
      insights.push({ type: 'warning', severity: 'medium', message: 'Mais de 50% dos recebíveis estão pendentes' });
    }
    
    if (byTenant.sollu?.leads?.ganho > 0) {
      insights.push({ type: 'opportunity', message: 'Sollu tem novos clientes ganhos — considere cross-sell no Bica Bar' });
    }
    
    if (consolidated.occupancy < 50) {
      insights.push({ type: 'suggestion', message: 'Ocupação abaixo de 50% — avalie promoções para Bica Bar e AMP 213' });
    }

    if (insights.length === 0) {
      insights.push({ type: 'info', message: 'Tudo em ordem — sem alertas críticos no momento' });
    }

    return insights;
  }
}

