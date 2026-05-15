export class OperationsMonitor {
  constructor(streamClient, { maxEvents = 500 } = {}) {
    this.streamClient = streamClient;
    this.maxEvents = maxEvents;
    this.state = {
      connectionStatus: 'idle',
      connected: false,
      error: null,
      tenantId: null,
      events: []
    };
  }

  start({ tenantId, limit = 50 } = {}) {
    this.state.connectionStatus = 'connecting';
    this.state.connected = false;
    this.state.error = null;
    this.state.tenantId = tenantId || null;
    this.state.events = [];

    this.streamClient.connect({
      tenantId,
      limit,
      onConnected: () => {
        this.state.connectionStatus = 'connected';
        this.state.connected = true;
      },
      onInit: (payload) => {
        const items = Array.isArray(payload?.events) ? payload.events : [];
        this.state.events = items.slice(0, this.maxEvents);
      },
      onEvent: (payload) => {
        if (!payload || typeof payload !== 'object') {
          return;
        }

        const next = [payload, ...this.state.events];
        const seen = new Set();
        this.state.events = next.filter((item) => {
          if (!item?.id || seen.has(item.id)) {
            return false;
          }
          seen.add(item.id);
          return true;
        }).slice(0, this.maxEvents);
      },
      onError: (error) => {
        this.state.connectionStatus = 'error';
        this.state.error = String(error?.message || error || 'stream_error');
        this.state.connected = false;
      }
    });
  }

  stop() {
    this.streamClient.disconnect();
    this.state.connectionStatus = 'idle';
    this.state.connected = false;
    this.state.error = null;
    this.state.events = [];
  }

  getViewModel({ type, status } = {}) {
    const allEvents = this.state.events;
    const events = allEvents.filter((item) => {
      if (type && item.type !== type) return false;
      if (status && item.status !== status) return false;
      return true;
    });

    const counters = {
      total: allEvents.length,
      success: allEvents.filter((item) => item.status === 'success').length,
      retry: allEvents.filter((item) => item.status === 'retry').length,
      deadLetter: allEvents.filter((item) => item.status === 'dead-letter').length
    };

    return {
      connectionStatus: this.state.connectionStatus,
      connected: this.state.connected,
      error: this.state.error,
      tenantId: this.state.tenantId,
      counters,
      filteredCount: events.length,
      events
    };
  }
}
