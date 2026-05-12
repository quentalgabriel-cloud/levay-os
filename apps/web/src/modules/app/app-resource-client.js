function toQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params || {})) {
    if (value != null && value !== '') {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

async function fetchJson(fetchImpl, url, options) {
  const response = await fetchImpl(url, options);
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `request_failed:${response.status}`);
  }

  return data;
}

export class AppResourceClient {
  constructor({ baseUrl = 'http://localhost:3000', fetchImpl = fetch } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.fetchImpl = fetchImpl;
  }

  get(path, query = {}, options = {}) {
    const headers = {
      ...(options.headers || {})
    };
    if (options.tenantId) {
      headers['x-tenant-id'] = options.tenantId;
    }
    return fetchJson(this.fetchImpl, `${this.baseUrl}${path}${toQuery(query)}`, {
      ...options,
      headers
    });
  }

  post(path, body = {}, options = {}) {
    const headers = {
      'content-type': 'application/json',
      ...(options.headers || {})
    };
    if (options.tenantId) {
      headers['x-tenant-id'] = options.tenantId;
    }
    return fetchJson(this.fetchImpl, `${this.baseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  }

  async loadSnapshot({ tenantId, role = 'operations' }) {
    const roleHeader = { headers: { 'x-role': role }, tenantId };
    const analyticsQuery = role === 'ceo' ? {} : { tenantId };
    const analyticsHeaders = { 'x-role': role };
    if (tenantId) {
      analyticsHeaders['x-tenant-id'] = tenantId;
    }
    const analyticsOptions =
      role === 'ceo'
        ? { headers: analyticsHeaders }
        : { ...roleHeader, headers: analyticsHeaders };
    const since24h = new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString();
    const [
      crm,
      billing,
      events,
      reservations,
      membership,
      qualityGates,
      contracts,
      analytics,
      operations,
      operationsEvents,
      recommendationEvents
    ] = await Promise.allSettled([
      this.get('/api/v1/crm/leads', { tenantId }, { tenantId }),
      this.get('/api/v1/billing/receivables', { tenantId }, { tenantId }),
      this.get('/api/v1/events', { tenantId }, { tenantId }),
      this.get('/api/v1/reservations', { tenantId }, { tenantId }),
      this.get('/api/v1/membership/operational-view', { tenantId }, { tenantId }),
      this.get('/api/v1/quality-gates/pending', { tenantId }, { tenantId }),
      this.get('/api/v1/contracts', { tenantId }, { tenantId }),
      this.get('/api/v1/analytics/executive', analyticsQuery, analyticsOptions),
      this.get('/api/v1/operations/events/summary', { tenantId }, { tenantId }),
      this.get('/api/v1/operations/events', { tenantId, limit: 15 }, { tenantId }),
      this.get('/api/v1/operations/events', {
        tenantId,
        flow: 'sollu.recommendation',
        since: since24h,
        limit: 250
      }, { tenantId })
    ]);

    let dashboardContext = null;
    try {
      dashboardContext = await this.getDashboardContext({ tenantId, role });
    } catch {
      dashboardContext = null;
    }

    return {
      crm,
      billing,
      events,
      reservations,
      membership,
      qualityGates,
      contracts,
      analytics,
      operations,
      operationsEvents,
      recommendationEvents,
      dashboardContext
    };
  }

  async bootstrapDemo({ tenantId }) {
    return this.post('/api/v1/demo/bootstrap', { tenantId }, { tenantId });
  }

  async updateLeadStage({ tenantId, leadId, stageId, actor = 'app-user' }) {
    return fetchJson(
      this.fetchImpl,
      `${this.baseUrl}/api/v1/crm/leads/${encodeURIComponent(leadId)}/stage`,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-tenant-id': tenantId },
        body: JSON.stringify({ tenantId, stageId, actor })
      }
    );
  }

  async triggerCollection({ tenantId, receivableId, channel = 'whatsapp' }) {
    return this.post(`/api/v1/billing/receivables/${encodeURIComponent(receivableId)}/collect`, {
      tenantId,
      channel
    }, { tenantId });
  }

  async decideQualityGate({ tenantId, gateId, decision, actor = 'app-user', justification }) {
    return this.post(`/api/v1/quality-gates/${encodeURIComponent(gateId)}/decision`, {
      tenantId,
      actor,
      decision,
      justification
    }, { tenantId });
  }

  async collectPendingReceivables({ tenantId, channel = 'whatsapp' }) {
    return this.post('/api/v1/billing/collect-pending', {
      tenantId,
      channel
    }, { tenantId });
  }

  async advanceLeadsToProposal({ tenantId, actor = 'app-user' }) {
    return this.post('/api/v1/crm/leads/advance-proposal', {
      tenantId,
      actor
    }, { tenantId });
  }

  async approvePendingGates({ tenantId, actor = 'app-user', justification }) {
    return this.post('/api/v1/quality-gates/approve-pending', {
      tenantId,
      actor,
      justification
    }, { tenantId });
  }

  async submitActionIntent({
    tenantId,
    actionId,
    payload = {},
    actor = 'app-user',
    role = 'operations',
    actorType = 'human'
  }) {
    return this.post('/api/v1/actions/intent', {
      tenantId,
      actionId,
      payload,
      actor,
      role,
      actorType
    }, { tenantId });
  }

  async publishOperationalEvent({
    tenantId,
    type,
    flow,
    status,
    actorType = 'human',
    payload = {}
  }) {
    return this.post('/api/v1/operations/events', {
      tenantId,
      type,
      flow,
      status,
      actorType,
      payload
    }, { tenantId });
  }

  async getDashboardContext({ tenantId, role = 'operations' }) {
    const headers = { 'x-role': role };
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }
    return this.get('/api/v1/dashboard/context', {}, { tenantId, headers });
  }
}
