import Anthropic from '@anthropic-ai/sdk'
import { NONO_SYSTEM_PROMPT } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface TriageResult {
  title: string
  status_cockpit: 'hoje' | 'decidir' | 'delegar'
  status: 'inbox' | 'em_movimento'
  priority: number
  minimum_movement: string
  company_slug: 'sollu' | 'amp213' | 'bica' | null
  justification: string
  error?: string
}

export async function triageCaptureWithAI(text: string): Promise<TriageResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada')
  }

  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
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
    return JSON.parse(jsonStr) as TriageResult
  } catch (err) {
    console.error('Falha ao parsear resposta do Nonô:', content.text)
    throw new Error('Falha na inteligência do Nonô')
  }
}
