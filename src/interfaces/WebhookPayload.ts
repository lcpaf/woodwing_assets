export interface WebhookPayload {
    timestamp: number;
    type: string;
    metadata: Record<string, any>;
    assetId: string;
    changedMetadata: Record<string, any>;
}
