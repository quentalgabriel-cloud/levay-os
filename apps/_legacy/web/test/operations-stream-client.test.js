import { describe, it, expect } from 'vitest';
import { OperationsStreamClient } from '../src/modules/operations/operations-stream-client.js';

class FakeEventSource {
  constructor(url) {
    this.url = url;
    this.listeners = new Map();
    this.closed = false;
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }

  emit(name, payload) {
    const handler = this.listeners.get(name);
    if (handler) {
      handler({ data: JSON.stringify(payload) });
    }
  }

  close() {
    this.closed = true;
  }
}

describe('operations stream client', () => {
  it('connects with tenant query and dispatches sse events', () => {
    let sourceRef;
    const client = new OperationsStreamClient({
      baseUrl: 'http://localhost:3000',
      eventSourceFactory: (url) => {
        sourceRef = new FakeEventSource(url);
        return sourceRef;
      }
    });

    const received = [];
    client.connect({
      tenantId: 'sollu',
      limit: 10,
      onConnected: (data) => received.push(['connected', data]),
      onInit: (data) => received.push(['init', data]),
      onEvent: (data) => received.push(['event', data])
    });

    expect(sourceRef.url).toBe('http://localhost:3000/api/v1/operations/events/stream?tenantId=sollu&limit=10');

    sourceRef.emit('connected', { connected: true });
    sourceRef.emit('init', { events: [{ id: 'e1' }] });
    sourceRef.emit('event', { id: 'e2' });

    expect(received).toEqual([
      ['connected', { connected: true }],
      ['init', { events: [{ id: 'e1' }] }],
      ['event', { id: 'e2' }]
    ]);
  });

  it('disconnects and closes underlying event source', () => {
    let sourceRef;
    const client = new OperationsStreamClient({
      eventSourceFactory: (url) => {
        sourceRef = new FakeEventSource(url);
        return sourceRef;
      }
    });

    client.connect();
    client.disconnect();
    expect(sourceRef.closed).toBe(true);
  });
});
