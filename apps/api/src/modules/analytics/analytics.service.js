export class AnalyticsService {
  constructor(repository) {
    this.repository = repository;
  }

  ingest(record) {
    this.repository.addRecord(record);
  }

  getExecutiveKpis({ tenantId, from, to }) {
    const rows = this.repository.query({ tenantId, from, to });
    const byTenant = new Map();

    for (const row of rows) {
      const current = byTenant.get(row.tenantId) || { revenue: 0, conversion: 0, efficiency: 0, count: 0 };
      current.revenue += row.revenue || 0;
      current.conversion += row.conversion || 0;
      current.efficiency += row.efficiency || 0;
      current.count += 1;
      byTenant.set(row.tenantId, current);
    }

    const tenants = Array.from(byTenant.entries()).map(([key, value]) => ({
      tenantId: key,
      revenue: value.revenue,
      conversion: value.count ? value.conversion / value.count : 0,
      efficiency: value.count ? value.efficiency / value.count : 0
    }));

    const consolidated = tenants.reduce((acc, item) => ({
      revenue: acc.revenue + item.revenue,
      conversion: acc.conversion + item.conversion,
      efficiency: acc.efficiency + item.efficiency
    }), { revenue: 0, conversion: 0, efficiency: 0 });

    const count = tenants.length || 1;
    consolidated.conversion = consolidated.conversion / count;
    consolidated.efficiency = consolidated.efficiency / count;

    return { tenants, consolidated };
  }
}

