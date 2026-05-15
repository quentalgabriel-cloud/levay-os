import { createHmac, timingSafeEqual } from 'node:crypto'

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
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)
  if (expectedBuf.length !== signatureBuf.length) return false
  return timingSafeEqual(expectedBuf, signatureBuf)
}
