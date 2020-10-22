import {WebhookConfig} from "./WebhookConfig";

import express = require('express');
import {NextFunction, Request, Response} from "express";

import compare = require('safe-compare');
import crypto = require('crypto');

// import createLogger = require('logger');
// const logger = createLogger.createLogger();

type WebhookSuccessHandler =
    (request: object) => void

type WebhookErrorHandler =
    (error: string) => void

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


    private readonly config: WebhookConfig;


    constructor(config: WebhookConfig) {
        this.config = config;
    }

    public listen = (successHandler: WebhookSuccessHandler, errorHandler: WebhookErrorHandler) => {

        const _this = this;

        const server = express();
        server.listen(this.config.port, this.config.bindTo)
        server.post('/', (req: Request, res: Response, next: NextFunction) => {

            // send response  so that Assets doesn't have to wait for the processing
            res.status(200);
            res.end();

            const signature: string = req.header('x-hook-signature') ?? '';
            const chunks: any = [];

            req.on('data', chunk => {
                chunks.push(chunk)
            });
            req.on('end', () => {
                const data = Buffer.concat(chunks);

                // validate the webhook signature
                if (!_this.validateSignature(signature, data)) {
                    return errorHandler('Invalid webhook signature. Webhook discarded.');
                }

                try {
                    return successHandler(JSON.parse(data.toString()));
                } catch (error) {
                    // logger.error(error);
                    return errorHandler(error);
                }
            });
            req.on('error', error => {
                errorHandler(error.message);
                return next(error.message)
            });

        });
        // logger.info('Listening for webhook connections on port ' + this.config.port);
    }

    private validateSignature = (signature: string, data: any) => {
        const hmac = crypto.createHmac('sha256', this.config.secretToken);
        hmac.update(data);
        const digest = hmac.digest('hex');
        return compare(digest, signature);
    };
}