import { z } from 'zod';

// --- Types & Schemas ---

export const whatsAppWebhookPayloadSchema = z.object({
  object: z.literal('whatsapp_business_account'),
  entry: z.array(z.object({
    id: z.string(),
    changes: z.array(z.object({
      field: z.string(),
      value: z.object({
        messaging_product: z.literal('whatsapp'),
        metadata: z.object({
          display_phone_number: z.string(),
          phone_number_id: z.string(),
        }),
        contacts: z.array(z.object({
          wa_id: z.string(),
          profile: z.object({ name: z.string() }).optional(),
        })).optional(),
        messages: z.array(z.object({
          from: z.string(),
          id: z.string(),
          timestamp: z.string(),
          type: z.string(),
          text: z.object({ body: z.string() }).optional(),
        })).optional(),
        statuses: z.array(z.object({
          id: z.string(),
          status: z.string(),
          timestamp: z.string(),
          recipient_id: z.string(),
        })).optional(),
      })
    })).min(1),
  })).min(1),
});

export type WhatsAppWebhookPayload = z.infer<typeof whatsAppWebhookPayloadSchema>;

export type SendWhatsAppTextMessageInput = {
  body: string;
  to: string;
};

export interface WhatsAppConfig {
  apiBaseUrl: string;
  phoneNumberId: string;
  accessToken: string;
}

// --- Service ---

export class WhatsAppService {
  constructor(private readonly config: WhatsAppConfig) {}

  async sendTextMessage(input: SendWhatsAppTextMessageInput) {
    const { apiBaseUrl, phoneNumberId, accessToken } = this.config;
    
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, '')}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: input.to,
          type: 'text',
          text: {
            preview_url: false,
            body: input.body,
          },
        }),
      }
    );

    const rawResponse = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(`WhatsApp provider failed: ${response.status} ${JSON.stringify(rawResponse)}`);
    }

    return rawResponse;
  }

  static parseWebhook(payload: unknown) {
    return whatsAppWebhookPayloadSchema.parse(payload);
  }
}
