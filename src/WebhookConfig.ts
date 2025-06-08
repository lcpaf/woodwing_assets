export interface WebhookConfig {
    /** Host/IP to bind the Express server to (e.g., '0.0.0.0' or 'localhost') */
    bindTo: string;

    /** Port to listen on (e.g., 3000) */
    port: number;

    /** Shared secret token for validating webhook signatures */
    secretToken: string;
}
