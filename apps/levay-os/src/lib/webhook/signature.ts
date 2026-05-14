import { createHash } from 'node:crypto'

export function verifyN8nSignature({
  rawBody,
  signature,
  secret,
}: {
  rawBody: string
  signature: string
  secret: string
}): boolean {
  if (!signature || !secret) return false
  const expected = createHash('sha256')
    .update(`${rawBody}:${secret}`)
    .digest('hex')
  return expected === signature
}
