import {AssetsServerBase} from './AssetsServerBase';
import {WebhookCreatePayload} from "./interfaces/WebhookCreatePayload";
import {WebhookCreateResponse} from "./interfaces/WebhookCreateResponse";

export class AssetsServerAdmin extends AssetsServerBase {
    public async currentState(): Promise<unknown> {
        return this.post('/controller/admin/activation/currentState');
    }

    public async activeUsers(): Promise<unknown> {
        return this.get('/private-api/system/active-users');
    }

    public async createWebhook(payload: WebhookCreatePayload): Promise<WebhookCreateResponse> {
        return this.post('/services/admin/webhook/', payload, true);
    }

    public async updateWebhook(webhookId: string, payload: WebhookCreatePayload): Promise<WebhookCreateResponse> {
        return this.put(`/services/admin/webhook/${webhookId}`, payload, true);
    }

    public async disabledWebhook(webhookId: string): Promise<WebhookCreateResponse> {
        return this.put(`services/admin/webhook/${webhookId}/disable`);
    }


    public async enabledWebhook(webhookId: string): Promise<WebhookCreateResponse> {
        return this.put(`services/admin/webhook/${webhookId}/enable`);
    }

    public async deleteWebhook(webhookId: string): Promise<void> {
        return this.delete(`/services/admin/webhook/${webhookId}`);
    }
}
