import { NextRequest, NextResponse } from 'next/server'
import { verifyN8nSignature } from '@/lib/webhook/signature'
import { ingestLeadFromWebhook } from '@/lib/webhook/ingest'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-n8n-signature') ?? ''
  const secret = process.env.N8N_WEBHOOK_SECRET ?? ''

  if (!verifyN8nSignature({ rawBody, signature, secret })) {
    return NextResponse.json({ ok: false, code: 'INVALID_SIGNATURE' }, { status: 401 })
  }

  const workspaceId = process.env.N8N_TARGET_WORKSPACE_ID
  if (!workspaceId) {
    console.error('[webhook/n8n] N8N_TARGET_WORKSPACE_ID não configurado')
    return NextResponse.json({ ok: false, code: 'SERVER_MISCONFIGURED' }, { status: 500 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, code: 'INVALID_JSON' }, { status: 400 })
  }

  const { eventId, name, phone, source, campaign } = payload as {
    eventId?: string
    name?: string
    phone?: string
    source?: string
    campaign?: string
  }

  if (!eventId || !name || !source) {
    return NextResponse.json({ ok: false, code: 'INVALID_PAYLOAD' }, { status: 400 })
  }

  const result = await ingestLeadFromWebhook({
    eventId,
    workspaceId,
    name,
    phone,
    source,
    campaign,
  })

  if (result.error) {
    console.error('[webhook/n8n] ingest error:', result.error)
    return NextResponse.json({ ok: false, code: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, ...result.data })
}
