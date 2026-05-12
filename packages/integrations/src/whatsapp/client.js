export class WhatsAppClient {
  async sendTemplate({ to, templateVersion, payload }) {
    return {
      ok: true,
      messageId: `${to}:${templateVersion}:${Date.now()}`,
      payload
    };
  }
}
