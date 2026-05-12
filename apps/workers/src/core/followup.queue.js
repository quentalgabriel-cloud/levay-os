export class FollowupQueue {
  constructor() {
    this.jobs = [];
    this.deadLetters = [];
  }

  enqueue(job) {
    const exists = this.jobs.some((item) => item.idempotencyKey === job.idempotencyKey);
    if (exists) {
      return { accepted: false, reason: 'duplicate' };
    }

    this.jobs.push({ ...job });
    return { accepted: true };
  }

  pendingUntil(date = new Date()) {
    const now = new Date(date).getTime();
    return this.jobs.filter((item) => item.status === 'pending' && new Date(item.scheduledAt).getTime() <= now);
  }

  markProcessed(idempotencyKey, metadata = {}) {
    const job = this.jobs.find((item) => item.idempotencyKey === idempotencyKey);
    if (!job) {
      return;
    }

    job.status = 'processed';
    job.processedAt = new Date().toISOString();
    job.messageId = metadata.messageId || null;
  }

  registerFailure(idempotencyKey, errorMessage) {
    const job = this.jobs.find((item) => item.idempotencyKey === idempotencyKey);
    if (!job) {
      return null;
    }

    job.attempts += 1;
    job.lastError = errorMessage;
    return job;
  }

  moveToDeadLetter(idempotencyKey) {
    const job = this.jobs.find((item) => item.idempotencyKey === idempotencyKey);
    if (!job) {
      return;
    }

    job.status = 'dead-letter';
    this.deadLetters.push({ ...job, movedAt: new Date().toISOString() });
  }
}
