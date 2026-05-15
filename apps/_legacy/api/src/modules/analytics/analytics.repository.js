export class AnalyticsRepository {
  constructor() {
    this.records = [];
  }

  addRecord(record) {
    this.records.push({
      ...record,
      createdAt: record.createdAt || new Date().toISOString()
    });
  }

  query({ tenantId, from, to }) {
    const fromTs = from ? new Date(from).getTime() : Number.MIN_SAFE_INTEGER;
    const toTs = to ? new Date(to).getTime() : Number.MAX_SAFE_INTEGER;
    return this.records.filter((item) => {
      const ts = new Date(item.createdAt).getTime();
      const tenantMatch = tenantId ? item.tenantId === tenantId : true;
      return tenantMatch && ts >= fromTs && ts <= toTs;
    });
  }
}

