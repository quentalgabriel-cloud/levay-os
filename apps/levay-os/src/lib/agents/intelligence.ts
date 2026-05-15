import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { NONO_SYSTEM_PROMPT } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const TriageResultSchema = z.object({
  title: z.string(),
  status_cockpit: z.enum(['hoje', 'decidir', 'delegar']),
  status: z.enum(['inbox', 'em_movimento']),
  priority: z.number(),
  minimum_movement: z.string(),
  company_slug: z.enum(['sollu', 'amp213', 'bica']).nullable(),
  justification: z.string(),
  error: z.string().optional(),
})

export type TriageResult = z.infer<typeof TriageResultSchema>

export async function triageCaptureWithAI(text: string): Promise<TriageResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada')
  }

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: NONO_SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `Processe esta captura: "${text}"` }
    ],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Resposta da IA não é texto')
  }

  try {
    const jsonStr = content.text.match(/\{[\s\S]*\}/)?.[0] || content.text
    const parsed = JSON.parse(jsonStr)
    return TriageResultSchema.parse(parsed)
  } catch (err) {
    console.error('Falha ao parsear resposta do Nonô:', content.text)
    throw new Error('Falha na inteligência do Nonô')
  }
}
