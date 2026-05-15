import { describe, it, expect } from 'vitest';
import { OperationsMonitor } from '../src/modules/operations/operations-monitor.js';

function createFakeStreamClient() {
  const handlers = {};
  return {
    connected: false,
    connect(args) {
      Object.assign(handlers, args);
      this.connected = true;
    },
    disconnect() {
      this.connected = false;
    },
    emit(name, data) {
      const fn = handlers[name];
      if (typeof fn === 'function') {
        fn(data);
      }
    }
  };
}

describe('operations monitor', () => {
  it('tracks connected state and counters from stream events', () => {
    const streamClient = createFakeStreamClient();
    const monitor = new OperationsMonitor(streamClient);

    monitor.start({ tenantId: 'sollu' });
    streamClient.emit('onConnected', {});
    streamClient.emit('onInit', {
      events: [
        { id: 'e1', type: 'followup.dispatched', status: 'success' },
        { id: 'e2', type: 'followup.retry_scheduled', status: 'retry' }
      ]
    });
    streamClient.emit('onEvent', { id: 'e3', type: 'followup.dead_letter', status: 'dead-letter' });

    const view = monitor.getViewModel();
    expect(view.connected).toBe(true);
    expect(view.counters.total).toBe(3);
    expect(view.counters.success).toBe(1);
    expect(view.counters.retry).toBe(1);
    expect(view.counters.deadLetter).toBe(1);
  });

  it('supports filtering by type and status', () => {
    const streamClient = createFakeStreamClient();
    const monitor = new OperationsMonitor(streamClient);

    monitor.start({ tenantId: 'sollu' });
    streamClient.emit('onInit', {
      events: [
        { id: 'e1', type: 'followup.dispatched', status: 'success' },
        { id: 'e2', type: 'followup.dispatched', status: 'success' },
        { id: 'e3', type: 'followup.retry_scheduled', status: 'retry' }
      ]
    });

    const filtered = monitor.getViewModel({ type: 'followup.dispatched', status: 'success' });
    expect(filtered.events).toHaveLength(2);
    expect(filtered.counters.total).toBe(3);
    expect(filtered.filteredCount).toBe(2);
  });

  it('handles stream error and stop', () => {
    const streamClient = createFakeStreamClient();
    const monitor = new OperationsMonitor(streamClient);

    monitor.start({ tenantId: 'sollu' });
    streamClient.emit('onError', new Error('stream down'));
    expect(monitor.getViewModel().error).toBe('stream down');
    expect(monitor.getViewModel().connected).toBe(false);

    monitor.stop();
    expect(streamClient.connected).toBe(false);
    expect(monitor.getViewModel().events).toHaveLength(0);
    expect(monitor.getViewModel().connectionStatus).toBe('idle');
  });

  it('clears stale events on tenant switch', () => {
    const streamClient = createFakeStreamClient();
    const monitor = new OperationsMonitor(streamClient);

    monitor.start({ tenantId: 'sollu' });
    streamClient.emit('onInit', {
      events: [{ id: 'e1', type: 'followup.dispatched', status: 'success' }]
    });
    expect(monitor.getViewModel().events).toHaveLength(1);

    monitor.start({ tenantId: 'amp213' });
    expect(monitor.getViewModel().events).toHaveLength(0);
    expect(monitor.getViewModel().tenantId).toBe('amp213');
  });
});
