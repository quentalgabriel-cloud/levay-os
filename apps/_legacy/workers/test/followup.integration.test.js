import { describe, it, expect } from 'vitest';
import { scheduleFollowups } from '../src/jobs/followup.scheduler.js';
import { FollowupQueue } from '../src/core/followup.queue.js';
import { FollowupDispatcher } from '../src/jobs/followup.dispatcher.js';

describe('Follow-up workers D+0 D+1 D+3', () => {
  it('schedules D+0, D+1 and D+3 jobs', () => {
    const jobs = scheduleFollowups({
      tenantId: 'sollu',
      leadId: 'lead-1',
      phone: '+5581999999999',
      now: '2026-03-19T10:00:00.000Z'
    });

    expect(jobs).toHaveLength(3);
    expect(jobs.map((item) => item.offsetDays)).toEqual([0, 1, 3]);
    expect(jobs[0].idempotencyKey).toBe('sollu:lead-1:D+0');
    expect(jobs[1].scheduledAt).toBe('2026-03-20T10:00:00.000Z');
    expect(jobs[2].scheduledAt).toBe('2026-03-22T10:00:00.000Z');
  });

  it('prevents duplicate jobs by idempotency_key and dispatches once', async () => {
    const queue = new FollowupQueue();
    const audit = [];
    const published = [];

    const whatsappClient = {
      calls: 0,
      async sendTemplate() {
        this.calls += 1;
        return { messageId: 'msg-1' };
      }
    };
    const operationsPublisher = {
      async publish(event) {
        published.push(event);
      }
    };

    const dispatcher = new FollowupDispatcher({
      queue,
      whatsappClient,
      auditLog: audit,
      operationsPublisher
    });

    const [job] = scheduleFollowups({
      tenantId: 'sollu',
      leadId: 'lead-dup',
      phone: '+5581999999999',
      now: '2026-03-19T10:00:00.000Z'
    });

    const first = queue.enqueue(job);
    const second = queue.enqueue(job);

    expect(first.accepted).toBe(true);
    expect(second.accepted).toBe(false);

    await dispatcher.dispatchDueJobs('2026-03-19T10:05:00.000Z');
    expect(whatsappClient.calls).toBe(1);
    expect(audit[0].status).toBe('success');
    expect(published).toHaveLength(1);
    expect(published[0].type).toBe('followup.dispatched');
  });

  it('retries and moves to dead-letter when failures persist', async () => {
    const queue = new FollowupQueue();
    const audit = [];
    const published = [];

    const whatsappClient = {
      async sendTemplate() {
        throw new Error('provider unavailable');
      }
    };
    const operationsPublisher = {
      async publish(event) {
        published.push(event);
      }
    };

    const dispatcher = new FollowupDispatcher({
      queue,
      whatsappClient,
      maxRetries: 3,
      auditLog: audit,
      operationsPublisher
    });

    const [job] = scheduleFollowups({
      tenantId: 'sollu',
      leadId: 'lead-fail',
      phone: '+5581999999999',
      now: '2026-03-19T10:00:00.000Z'
    });

    queue.enqueue(job);

    await dispatcher.dispatchDueJobs('2026-03-19T10:05:00.000Z');
    await dispatcher.dispatchDueJobs('2026-03-19T10:06:00.000Z');
    await dispatcher.dispatchDueJobs('2026-03-19T10:07:00.000Z');

    expect(queue.deadLetters).toHaveLength(1);
    expect(queue.deadLetters[0].idempotencyKey).toBe('sollu:lead-fail:D+0');
    expect(audit.filter((item) => item.status === 'retry')).toHaveLength(2);
    expect(audit.filter((item) => item.status === 'dead-letter')).toHaveLength(1);
    expect(published.filter((item) => item.type === 'followup.retry_scheduled')).toHaveLength(2);
    expect(published.filter((item) => item.type === 'followup.dead_letter')).toHaveLength(1);
  });
});
