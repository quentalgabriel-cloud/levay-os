export function buildAlerts(data) {
  const alerts = [];
  for (const tenant of data?.tenants || []) {
    if (tenant.conversion < 0.25) {
      alerts.push({
        severity: 'high',
        tenantId: tenant.tenantId,
        context: 'Conversao abaixo do limite esperado'
      });
    }
    if (tenant.efficiency < 0.5) {
      alerts.push({
        severity: 'medium',
        tenantId: tenant.tenantId,
        context: 'Eficiencia operacional baixa'
      });
    }
  }
  return alerts;
}
