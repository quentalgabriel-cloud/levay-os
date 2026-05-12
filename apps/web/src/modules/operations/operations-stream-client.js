function parseJsonData(raw) {
  if (typeof raw !== 'string' || raw.length === 0) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export class OperationsStreamClient {
  constructor({ baseUrl = 'http://localhost:3000', eventSourceFactory = (url) => new EventSource(url) } = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.eventSourceFactory = eventSourceFactory;
    this.source = null;
  }

  connect({ tenantId, limit = 50, onConnected, onInit, onEvent, onHeartbeat, onError } = {}) {
    this.disconnect();

    const params = new URLSearchParams();
    if (tenantId) params.set('tenantId', tenantId);
    if (limit) params.set('limit', String(limit));
    const query = params.toString();
    const url = `${this.baseUrl}/api/v1/operations/events/stream${query ? `?${query}` : ''}`;

    const source = this.eventSourceFactory(url);
    this.source = source;

    source.addEventListener('connected', (evt) => {
      onConnected?.(parseJsonData(evt.data));
    });

    source.addEventListener('init', (evt) => {
      onInit?.(parseJsonData(evt.data));
    });

    source.addEventListener('event', (evt) => {
      onEvent?.(parseJsonData(evt.data));
    });

    source.addEventListener('heartbeat', (evt) => {
      onHeartbeat?.(parseJsonData(evt.data));
    });

    source.onerror = (error) => {
      onError?.(error);
    };
  }

  disconnect() {
    if (this.source && typeof this.source.close === 'function') {
      this.source.close();
    }
    this.source = null;
  }
}
