export class BillingService {
  constructor(repository, paymentAdapter) {
    this.repository = repository;
    this.paymentAdapter = paymentAdapter;
  }

  createReceivable(payload) {
    return this.repository.createReceivable(payload);
  }

  listReceivables(tenantId) {
    return this.repository.listReceivables(tenantId);
  }

  triggerCollection({ tenantId, receivableId, channel = 'whatsapp' }) {
    const receivable = this.repository.findReceivable(tenantId, receivableId);
    if (!receivable) {
      return null;
    }

    this.repository.addBillingEvent({
      tenantId,
      receivableId,
      type: 'collection.triggered',
      status: 'sent',
      metadata: { channel }
    });

    return receivable;
  }

  async applyPaymentCallback({ tenantId, providerPayload }) {
    const normalized = await this.paymentAdapter.normalizeCallback(providerPayload);
    const updated = this.repository.updateReceivableStatus({
      tenantId,
      receivableId: normalized.receivableId,
      status: normalized.status
    });

    if (!updated) {
      return null;
    }

    this.repository.addBillingEvent({
      tenantId,
      receivableId: normalized.receivableId,
      type: 'payment.callback',
      status: normalized.status,
      metadata: { paidAt: normalized.paidAt }
    });

    return updated;
  }

  listBillingEvents(tenantId) {
    return this.repository.listBillingEvents(tenantId);
  }
}

