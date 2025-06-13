import {AssetsServerBase} from './AssetsServerBase';
import {WebhookCreateRequest} from './interfaces/Request/Admin';
import {WebhookCreateResponse} from './interfaces/Response/Admin';

export class AssetsServerAdmin {
  constructor(private base: AssetsServerBase) {}

  public async currentState(): Promise<unknown> {
    return this.base.post('/controller/admin/activation/currentState');
  }

  public async activeUsers(): Promise<unknown> {
    return this.base.get('/private-api/system/active-users');
  }

  public async createWebhook(payload: WebhookCreateRequest): Promise<WebhookCreateResponse> {
    return this.base.post('/services/admin/webhook/', payload, true);
  }

  public async updateWebhook(webhookId: string, payload: WebhookCreateRequest): Promise<WebhookCreateResponse> {
    return this.base.put(`/services/admin/webhook/${webhookId}`, payload, true);
  }

  public async disabledWebhook(webhookId: string): Promise<WebhookCreateResponse> {
    return this.base.put(`services/admin/webhook/${webhookId}/disable`);
  }

  public async enabledWebhook(webhookId: string): Promise<WebhookCreateResponse> {
    return this.base.put(`services/admin/webhook/${webhookId}/enable`);
  }

  public async deleteWebhook(webhookId: string): Promise<void> {
    return this.base.delete(`/services/admin/webhook/${webhookId}`);
  }
}
