import Fastify from 'fastify';
import { CrmRepository } from './modules/crm/crm.repository.js';
import { AuditService } from './modules/audit/audit.service.js';
import { CrmService } from './modules/crm/crm.service.js';
import { crmRoutes } from './modules/crm/crm.controller.js';
import { BillingRepository } from './modules/billing/billing.repository.js';
import { BillingService } from './modules/billing/billing.service.js';
import { billingRoutes } from './modules/billing/billing.controller.js';
import { PaymentProviderAdapter } from '../../../packages/integrations/src/payments/payment.adapter.js';
import { N8nWebhookService } from './modules/integrations/n8n.webhook.service.js';
import { n8nWebhookRoutes } from './modules/integrations/n8n.webhook.controller.js';
import { EventsRepository } from './modules/events/events.repository.js';
import { EventsService } from './modules/events/events.service.js';
import { eventsRoutes } from './modules/events/events.controller.js';
import { ReservationsRepository } from './modules/reservations/reservations.repository.js';
import { ReservationsService } from './modules/reservations/reservations.service.js';
import { reservationsRoutes } from './modules/reservations/reservations.controller.js';
import { MembershipRepository } from './modules/membership/membership.repository.js';
import { MembershipService } from './modules/membership/membership.service.js';
import { membershipRoutes } from './modules/membership/membership.controller.js';
import { QualityGatesRepository } from './modules/quality-gates/quality-gates.repository.js';
import { QualityGatesService } from './modules/quality-gates/quality-gates.service.js';
import { qualityGatesRoutes } from './modules/quality-gates/quality-gates.controller.js';
import { ContractsRepository } from './modules/contracts/contracts.repository.js';
import { ContractsService } from './modules/contracts/contracts.service.js';
import { contractsRoutes } from './modules/contracts/contracts.controller.js';
import { GoogleDriveClient } from '../../../packages/integrations/src/google-drive/client.js';
import { AnalyticsRepository } from './modules/analytics/analytics.repository.js';
import { AnalyticsService } from './modules/analytics/analytics.service.js';
import { analyticsRoutes } from './modules/analytics/analytics.controller.js';
import { OperationsRepository } from './modules/operations/operations.repository.js';
import { OperationsService } from './modules/operations/operations.service.js';
import { operationsRoutes } from './modules/operations/operations.controller.js';
import { ActionsService } from './modules/actions/actions.service.js';
import { actionsRoutes } from './modules/actions/actions.controller.js';
import { dashboardRoutes } from './modules/dashboard/dashboard.controller.js';
import { TasksRepository } from './modules/tasks/tasks.repository.js';
import { TasksService } from './modules/tasks/tasks.service.js';
import { tasksRoutes } from './modules/tasks/tasks.controller.js';
import {
  createSessionContext,
  mutateRequestTenant
} from './modules/session/session.context.js';

const DEFAULT_ALLOWED_ORIGIN = 'http://localhost:3200';
const READ_ONLY_TENANT_QUERY_FALLBACK = new Set([
  '/api/v1/operations/events/summary',
  '/api/v1/operations/events/stream'
]);

function resolveAllowedOrigin(request) {
  return process.env.ALLOWED_ORIGIN || request.headers.origin || DEFAULT_ALLOWED_ORIGIN;
}

export function buildApp() {
  const app = Fastify({ logger: false });

  app.decorateRequest('session', null);
  app.decorate('resolveAllowedOrigin', resolveAllowedOrigin);

  app.addHook('onRequest', async (request, reply) => {
    reply.header('access-control-allow-origin', resolveAllowedOrigin(request));
    reply.header('access-control-allow-methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    reply.header('access-control-allow-headers', 'content-type,x-role,x-tenant-id');
    reply.header('access-control-allow-credentials', 'true');

    if (request.method === 'OPTIONS') {
      return reply.code(204).send();
    }
  });

  app.addHook('preHandler', async (request, reply) => {
    if (!request.url.startsWith('/api/v1')) return;
    if (request.url.startsWith('/api/v1/demo/bootstrap')) return;

    const roleHeader = request.headers['x-role'] || 'operator';
    if (request.url.startsWith('/api/v1/analytics/executive')) {
      const tenantQuery = request.query?.tenantId;
      if (roleHeader === 'ceo' && !tenantQuery) {
        // allow CEO cross-tenant summary when tenant query is absent
        // other enforcement happens below
      }
    }

    const tenantHeader = request.headers['x-tenant-id'];
    const tenantQuery = request.query?.tenantId;
    const allowQueryTenantFallback =
      request.method === 'GET' &&
      READ_ONLY_TENANT_QUERY_FALLBACK.has(request.routeOptions?.url || request.routerPath || '');
    const effectiveTenant = tenantHeader || (allowQueryTenantFallback ? tenantQuery : null);
    if (!effectiveTenant) {
      return reply.code(401).send({ message: 'x-tenant-id header is required' });
    }

    const payloadTenant = request.body?.tenantId || tenantQuery;
    if (payloadTenant && payloadTenant !== effectiveTenant) {
      return reply.code(403).send({ message: 'tenant mismatch' });
    }

    request.session = createSessionContext({ tenantId: effectiveTenant, role: roleHeader });
    const isExecutiveAnalytics = request.url.startsWith('/api/v1/analytics/executive');
    const absentAnalyticsTenant = isExecutiveAnalytics && roleHeader === 'ceo' && !request.query?.tenantId && !request.body?.tenantId;
    if (!absentAnalyticsTenant) {
      mutateRequestTenant(request, effectiveTenant);
    }
  });

  const crmRepository = new CrmRepository();
  const auditService = new AuditService(crmRepository);
  const crmService = new CrmService(crmRepository, auditService);
  const billingRepository = new BillingRepository();
  const paymentAdapter = new PaymentProviderAdapter();
  const billingService = new BillingService(billingRepository, paymentAdapter);
  const n8nService = new N8nWebhookService(crmService);
  const eventsRepository = new EventsRepository();
  const eventsService = new EventsService(eventsRepository);
  const reservationsRepository = new ReservationsRepository();
  const reservationsService = new ReservationsService(reservationsRepository);
  const membershipRepository = new MembershipRepository();
  const membershipService = new MembershipService(membershipRepository);
  const qualityGatesRepository = new QualityGatesRepository();
  const qualityGatesService = new QualityGatesService(qualityGatesRepository);
  const contractsRepository = new ContractsRepository();
  const driveClient = new GoogleDriveClient();
  const contractsService = new ContractsService(contractsRepository, driveClient);
  const analyticsRepository = new AnalyticsRepository();
  const analyticsService = new AnalyticsService(analyticsRepository);
  const operationsRepository = new OperationsRepository();
  const operationsService = new OperationsService(operationsRepository);
  const tasksRepository = new TasksRepository();
  const tasksService = new TasksService(tasksRepository);
  const actionsService = new ActionsService({
    crmService,
    billingService,
    qualityGatesService,
    operationsService
  });

  app.post('/api/v1/demo/bootstrap', async (request, reply) => {
    const tenantId = request.body?.tenantId || request.query?.tenantId || 'sollu';

    const lead = crmService.createLead({
      tenantId,
      name: 'Lead Demo Sollu',
      nextFollowUpAt: '2026-03-20T12:00:00.000Z'
    });

    const receivable = billingService.createReceivable({
      tenantId,
      customerName: 'Cliente Demo Sollu',
      amount: 2400,
      dueDate: '2026-03-25'
    });

    billingService.triggerCollection({
      tenantId,
      receivableId: receivable.id,
      channel: 'whatsapp'
    });

    const gate = qualityGatesService.createGate({
      tenantId,
      flowName: 'billing.collection',
      stepName: 'send_whatsapp',
      reason: 'manual_review_demo'
    });

    analyticsService.ingest({
      tenantId,
      revenue: 2400,
      conversion: 0.42,
      efficiency: 0.81,
      createdAt: '2026-03-19T12:00:00.000Z'
    });

    const contractResult = await contractsService.uploadContract({
      tenantId,
      customerName: 'Cliente Demo Sollu',
      contentBase64: 'JVBERi0xLjQ='
    });

    operationsService.publish({
      tenantId,
      type: 'demo.bootstrap.completed',
      flow: 'sollu.demo',
      status: 'success',
      actorType: 'system',
      payload: {
        leadId: lead.id,
        receivableId: receivable.id,
        gateId: gate.id,
        contractOk: contractResult.ok
      }
    });

    return reply.code(201).send({
      tenantId,
      leadId: lead.id,
      receivableId: receivable.id,
      gateId: gate.id,
      contractId: contractResult.ok ? contractResult.metadata.id : null,
      operationsSeeded: true
    });
  });

  app.register(crmRoutes, { crmService });
  app.register(billingRoutes, { billingService });
  app.register(n8nWebhookRoutes, { n8nService });
  app.register(eventsRoutes, { eventsService });
  app.register(reservationsRoutes, { reservationsService });
  app.register(membershipRoutes, { membershipService });
  app.register(qualityGatesRoutes, { qualityGatesService });
  app.register(contractsRoutes, { contractsService });
  app.register(analyticsRoutes, { analyticsService });
  app.register(operationsRoutes, { operationsService });
  app.register(tasksRoutes, { tasksService });
  app.register(actionsRoutes, { actionsService });
  app.register(dashboardRoutes);
  return app;
}
