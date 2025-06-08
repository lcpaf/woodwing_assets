import express, {NextFunction, Request, Response} from 'express';
import crypto from 'crypto';
import {WebhookConfig} from './WebhookConfig';

type WebhookPayload = Record<string, any>;

type WebhookSuccessHandler = (request: WebhookPayload) => void;
type WebhookErrorHandler = (error: string) => void;

export class AssetsWebhook {
    public readonly ASSET_CHECKIN = 'asset_checkin';
    public readonly ASSET_REMOVE = 'asset_remove';
    public readonly ASSET_CHECKOUT = 'asset_checkout';
    public readonly ASSET_RENAME = 'asset_rename';
    public readonly ASSET_CREATE = 'asset_create';
    public readonly ASSET_UNDO_CHECKOUT = 'asset_undo_checkout';
    public readonly ASSET_CREATE_BY_COPY = 'asset_create_by_copy';
    public readonly ASSET_UPDATE_METADATA = 'asset_update_metadata';
    public readonly ASSET_CREATE_FROM_FILESTORE_RESCUE = 'asset_create_from_filestore_rescue';
    public readonly AUTHKEY_CREATE = 'authkey_create';
    public readonly ASSET_CREATE_FROM_VERSION = 'asset_create_from_version';
    public readonly AUTHKEY_REMOVE = 'authkey_remove';
    public readonly ASSET_MOVE = 'asset_move';
    public readonly FOLDER_CREATE = 'folder_create';
    public readonly ASSET_PROMOTE = 'asset_promote';
    public readonly FOLDER_REMOVE = 'folder_remove';

    constructor(private readonly config: WebhookConfig) {
    }

    public listen(successHandler: WebhookSuccessHandler, errorHandler: WebhookErrorHandler): void {
        const server = express();

        // Use raw body middleware to validate the HMAC
        server.use(
            express.raw({
                type: '*/*',
                limit: '1mb',
            })
        );

        server.post('/', (req: Request, res: Response, next: NextFunction) => {
            const signature = req.header('x-hook-signature') ?? '';
            const rawBody = req.body as Buffer;

            // Respond immediately to avoid timeout on Assets side
            res.status(200).end();

            try {
                if (!this.validateSignature(signature, rawBody)) {
                    return errorHandler('Invalid webhook signature. Webhook discarded.');
                }

                const payload: WebhookPayload = JSON.parse(rawBody.toString());
                successHandler(payload);
            } catch (err: any) {
                errorHandler(`Webhook processing error: ${err.message || err}`);
                next(err);
            }
        });

        server.listen(this.config.port, this.config.bindTo, () => {
            console.info(`Listening for webhook connections on ${this.config.bindTo}:${this.config.port}`);
        });
    }

    private validateSignature(signature: string, data: Buffer): boolean {
        const hmac = crypto.createHmac('sha256', this.config.secretToken);
        hmac.update(data);
        const digest = hmac.digest('hex');

        const bufA = Buffer.from(digest, 'utf8');
        const bufB = Buffer.from(signature, 'utf8');

        if (bufA.length !== bufB.length) return false;

        try {
            return crypto.timingSafeEqual(bufA, bufB);
        } catch {
            return false;
        }
    }
}
