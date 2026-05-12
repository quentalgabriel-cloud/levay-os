import { createHash } from 'node:crypto';

export function verifyN8nSignature({ rawBody, signature, secret }) {
  if (!signature || !secret) {
    return false;
  }

  const expected = createHash('sha256').update(`${rawBody}:${secret}`).digest('hex');
  return expected === signature;
}

