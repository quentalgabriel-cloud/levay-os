const DAY_MS = 24 * 60 * 60 * 1000;

function toIso(date) {
  return new Date(date).toISOString();
}

export function scheduleFollowups({ tenantId, leadId, phone, templateVersion = 'v1', now = new Date() }) {
  const base = new Date(now).getTime();

  return [0, 1, 3].map((offsetDays) => ({
    idempotencyKey: `${tenantId}:${leadId}:D+${offsetDays}`,
    tenantId,
    leadId,
    phone,
    templateVersion,
    offsetDays,
    scheduledAt: toIso(base + offsetDays * DAY_MS),
    attempts: 0,
    status: 'pending'
  }));
}
