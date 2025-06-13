import express, { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import http from 'http';
import { WebhookConfig } from './WebhookConfig';
import { WebhookPayload } from './interfaces/Payload';

type WebhookSuccessHandler = (request: WebhookPayload) => void;
type WebhookErrorHandler = (error: string) => void;

export class AssetsWebhook {
  private serverInstance: http.Server | null = null;

  public static readonly ASSET_CHECKIN = 'asset_checkin';
  public static readonly ASSET_CHECKOUT = 'asset_checkout';
  public static readonly ASSET_CREATE = 'asset_create';
  public static readonly ASSET_CREATE_BY_COPY = 'asset_create_by_copy';
  public static readonly ASSET_CREATE_FROM_FILESTORE_RESCUE = 'asset_create_from_filestore_rescue';
  public static readonly ASSET_MOVE = 'asset_move';
  public static readonly ASSET_PROMOTE = 'asset_promote';
  public static readonly ASSET_REMOVE = 'asset_remove';
  public static readonly ASSET_RENAME = 'asset_rename';
  public static readonly ASSET_UNDO_CHECKOUT = 'asset_undo_checkout';
  public static readonly ASSET_UPDATE_METADATA = 'asset_update_metadata';
  public static readonly AUTHKEY_CREATE = 'authkey_create';
  public static readonly AUTHKEY_REMOVE = 'authkey_remove';
  public static readonly FOLDER_CREATE = 'folder_create';
  public static readonly FOLDER_REMOVE = 'folder_remove';

  constructor(private readonly config: WebhookConfig) {}

  public listen(successHandler: WebhookSuccessHandler, errorHandler: WebhookErrorHandler): void {
    const app = express();

    app.use(
      express.raw({
        type: '*/*',
        limit: '1mb',
      }),
    );

    app.post('/', (req: Request, res: Response, next: NextFunction) => {
      const signature = req.header('x-hook-signature') ?? '';
      const rawBody = req.body as Buffer;

      res.status(200).end(); // respond immediately

      try {
        if (!AssetsWebhook.validateSignature(signature, rawBody, this.config.secretToken)) {
          return errorHandler('Invalid webhook signature. Webhook discarded.');
        }

        const payload: WebhookPayload = JSON.parse(rawBody.toString());
        successHandler(payload);
      } catch (err: any) {
        errorHandler(`Webhook processing error: ${err.message || err}`);
        next(err);
      }
    });

    this.serverInstance = app.listen(this.config.port, this.config.bindTo, () => {
      console.info(`Webhook listener started on ${this.config.bindTo}:${this.config.port}`);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.serverInstance) {
        this.serverInstance.close((err) => {
          if (err) {
            return reject(err);
          }
          console.info('Webhook listener stopped.');
          this.serverInstance = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public static validateSignature(signature: string, data: Buffer, secretToken: string): boolean {
    const hmac = crypto.createHmac('sha256', secretToken);
    hmac.update(data);
    const digest = hmac.digest('hex');

    const bufA = Buffer.from(digest, 'utf8');
    const bufB = Buffer.from(signature, 'utf8');

    if (bufA.length !== bufB.length) {
      return false;
    }

    try {
      return crypto.timingSafeEqual(bufA, bufB);
    } catch {
      return false;
    }
  }
}
