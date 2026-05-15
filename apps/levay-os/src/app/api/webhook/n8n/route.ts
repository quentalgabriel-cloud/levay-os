import { NextRequest, NextResponse } from 'next/server'
import { verifyN8nSignature } from '@/lib/webhook/signature'
import { ingestLeadFromWebhook } from '@/app/actions/leads'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-n8n-signature') ?? ''
  const secret = process.env.N8N_WEBHOOK_SECRET ?? ''

  if (!verifyN8nSignature({ rawBody, signature, secret })) {
    return NextResponse.json({ ok: false, code: 'INVALID_SIGNATURE' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: false, code: 'INVALID_JSON' }, { status: 400 })
  }

  const { eventId, workspaceId, name, phone, source, campaign } = payload as {
    eventId?: string
    workspaceId?: string
    name?: string
    phone?: string
    source?: string
    campaign?: string
  }

  if (!eventId || !workspaceId || !name || !source) {
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
