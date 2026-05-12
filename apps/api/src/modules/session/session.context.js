export function createSessionContext({ tenantId, role }) {
  return {
    tenantId,
    role: role || 'operator',
    resolvedAt: new Date().toISOString()
  };
}

export function mutateRequestTenant(request, tenantId) {
  if (!tenantId) return;
  if (request.body && typeof request.body === 'object') {
    request.body.tenantId = tenantId;
  }
  if (request.query && typeof request.query === 'object') {
    request.query.tenantId = tenantId;
  }
}

export function resolveTenantId(request) {
  return request.session?.tenantId || null;
}

export function resolveRole(request) {
  return request.session?.role || 'operator';
}
