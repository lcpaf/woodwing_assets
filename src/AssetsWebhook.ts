import {WebhookConfig} from "./WebhookConfig";

import express = require('express');
import {NextFunction, Request, Response} from "express";

const compare = require('secure-compare');
const crypto = require('crypto');

const createLogger = require('logging');
const logger = createLogger.default('woodwing_assets_webhook');

interface WebhookSuccessHandler {
    (request: object): void
}

interface WebhookErrorHandler {
    (error: string): void
}

export class AssetsWebhook {

    private readonly config: WebhookConfig;


    constructor(config: WebhookConfig) {
        this.config = config;
    }

    public listen = (successHandler: WebhookSuccessHandler, errorHandler: WebhookErrorHandler) => {

        let _this = this;

        let server = express();
        server.listen(this.config.port)
        server.post('/', (req: Request, res: Response, next: NextFunction) => {

            // send response  so that Assets doesn't have to wait for the processing
            res.status(200);

            let signature = req.header('x-hook-signature'),
                chunks: any = [];

            req.on('data', chunk => {
                chunks.push(chunk)
            });
            req.on('end', () => {
                const data = Buffer.concat(chunks);

                // validate the webhook signature
                if (!_this.validateSignature(signature, data)) {
                    throw new Error('Invalid webhook signature. Webhook discarded.');
                }

                try {
                    return successHandler(JSON.parse(data.toString()));
                } catch (error) {
                    logger.error(error);
                    return errorHandler(error);
                }
            });
            req.on('error', error => {
                errorHandler(error.message);
                return next(error.message)
            });

        });
        logger.info('Listening for webhook connections on port ' + this.config.port);
    }

    private validateSignature = (signature: string | undefined, data: any) => {
        let hmac = crypto.createHmac('sha256', this.config.secretToken);
        hmac.update(data);
        let digest = hmac.digest('hex');
        return compare(digest, signature);
    };
}