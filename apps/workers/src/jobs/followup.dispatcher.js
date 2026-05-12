export class FollowupDispatcher {
  constructor({ queue, whatsappClient, maxRetries = 3, auditLog = [], operationsPublisher = null }) {
    this.queue = queue;
    this.whatsappClient = whatsappClient;
    this.maxRetries = maxRetries;
    this.auditLog = auditLog;
    this.operationsPublisher = operationsPublisher;
  }

  async publishOperationalEvent(event) {
    if (!this.operationsPublisher || typeof this.operationsPublisher.publish !== 'function') {
      return;
    }
    await this.operationsPublisher.publish(event);
  }

  async dispatchDueJobs(now = new Date()) {
    const jobs = this.queue.pendingUntil(now);

    for (const job of jobs) {
      try {
        const result = await this.whatsappClient.sendTemplate({
          to: job.phone,
          templateVersion: job.templateVersion,
          payload: {
            leadId: job.leadId,
            offsetDays: job.offsetDays
          }
        });

        this.queue.markProcessed(job.idempotencyKey, { messageId: result.messageId });
        this.auditLog.push({
          tenantId: job.tenantId,
          leadId: job.leadId,
          idempotencyKey: job.idempotencyKey,
          status: 'success',
          attempts: job.attempts + 1,
          createdAt: new Date().toISOString()
        });
        await this.publishOperationalEvent({
          tenantId: job.tenantId,
          type: 'followup.dispatched',
          flow: 'sollu.followup',
          status: 'success',
          actorType: 'worker',
          payload: {
            leadId: job.leadId,
            idempotencyKey: job.idempotencyKey,
            messageId: result.messageId,
            offsetDays: job.offsetDays
          }
        });
      } catch (error) {
        const failedJob = this.queue.registerFailure(job.idempotencyKey, String(error.message || error));

        if (failedJob && failedJob.attempts >= this.maxRetries) {
          this.queue.moveToDeadLetter(job.idempotencyKey);
          this.auditLog.push({
            tenantId: job.tenantId,
            leadId: job.leadId,
            idempotencyKey: job.idempotencyKey,
            status: 'dead-letter',
            attempts: failedJob.attempts,
            error: failedJob.lastError,
            createdAt: new Date().toISOString()
          });
          await this.publishOperationalEvent({
            tenantId: job.tenantId,
            type: 'followup.dead_letter',
            flow: 'sollu.followup',
            status: 'dead-letter',
            actorType: 'worker',
            payload: {
              leadId: job.leadId,
              idempotencyKey: job.idempotencyKey,
              attempts: failedJob.attempts,
              error: failedJob.lastError
            }
          });
        } else {
          this.auditLog.push({
            tenantId: job.tenantId,
            leadId: job.leadId,
            idempotencyKey: job.idempotencyKey,
            status: 'retry',
            attempts: failedJob ? failedJob.attempts : 1,
            error: String(error.message || error),
            createdAt: new Date().toISOString()
          });
          await this.publishOperationalEvent({
            tenantId: job.tenantId,
            type: 'followup.retry_scheduled',
            flow: 'sollu.followup',
            status: 'retry',
            actorType: 'worker',
            payload: {
              leadId: job.leadId,
              idempotencyKey: job.idempotencyKey,
              attempts: failedJob ? failedJob.attempts : 1,
              error: String(error.message || error)
            }
          });
        }
      }
    }

    return { processed: jobs.length };
  }
}
