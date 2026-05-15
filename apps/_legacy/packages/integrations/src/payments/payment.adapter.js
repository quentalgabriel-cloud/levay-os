export class PaymentProviderAdapter {
  async normalizeCallback(payload) {
    return {
      receivableId: payload.receivableId,
      status: payload.status,
      paidAt: payload.paidAt || null
    };
  }
}

