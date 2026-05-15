export class N8nWebhookService {
  constructor(crmService) {
    this.crmService = crmService;
    this.integrationLogs = [];
    this.processedEvents = new Set();
  }

  ingestLead(payload) {
    const { eventId, tenantId, name, phone, source, campaign, timestamp } = payload;

    if (!eventId || !tenantId || !name || !source) {
      this.integrationLogs.push({
        eventId: eventId || null,
        tenantId: tenantId || null,
        status: 'invalid_payload',
        createdAt: new Date().toISOString()
      });
      return { ok: false, code: 'INVALID_PAYLOAD' };
    }

    if (this.processedEvents.has(eventId)) {
      this.integrationLogs.push({
        eventId,
        tenantId,
        status: 'duplicate_ignored',
        createdAt: new Date().toISOString()
      });
      return { ok: true, duplicate: true };
    }

    const lead = this.crmService.createLead({
      tenantId,
      name,
      nextFollowUpAt: timestamp || null
    });

    this.processedEvents.add(eventId);
    this.integrationLogs.push({
      eventId,
      tenantId,
      status: 'ingested',
      leadId: lead.id,
      metadata: { source, campaign: campaign || null, phone: phone || null },
      createdAt: new Date().toISOString()
    });

    return { ok: true, leadId: lead.id };
  }

  listLogs(tenantId) {
    return this.integrationLogs.filter((item) => item.tenantId === tenantId);
  }
}

