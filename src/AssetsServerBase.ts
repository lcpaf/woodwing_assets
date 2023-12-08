import {AssetsConfig} from "./AssetsConfig";
import {AssetsLogin} from "./AssetsLogin";
import Promise = require("bluebird");
import request = require('request');
import http = require('http');
import https = require('https');
import fs = require('fs');

export class AssetsServerBase {

    protected readonly config: AssetsConfig;
    private authToken: string | null = null;
    private authTimestamp: Date | null = null;
    private tokenValidity: number;

    public readonly FOLDER_REPLACE_POLICY_AUTO_RENAME = 'AUTO_RENAME';
    public readonly FOLDER_REPLACE_POLICY_MERGE = 'MERGE';
    public readonly FOLDER_REPLACE_POLICY_THROW_EXCEPTION = 'THROW_EXCEPTION';

    public readonly FILE_REPLACE_POLICY_AUTO_RENAME = 'AUTO_RENAME';
    public readonly FILE_REPLACE_POLICY_OVERWRITE = 'OVERWRITE';
    public readonly FILE_REPLACE_POLICY_OVERWRITE_IF_NEWER = 'OVERWRITE_IF_NEWER';
    public readonly FILE_REPLACE_POLICY_REMOVE_SOURCE = 'REMOVE_SOURCE';
    public readonly FILE_REPLACE_POLICY_THROW_EXCEPTION = 'THROW_EXCEPTION';
    public readonly FILE_REPLACE_POLICY_DO_NOTHING = 'DO_NOTHING';

    constructor(config: AssetsConfig) {
        this.config = config;
        this.authToken = null;
        this.tokenValidity = ((config.tokenValidityInMinutes ?? 30) - 2) * 60 * 1000
    }

    public get = (service: string, form: object = {}) => this.call(service, 'GET', form);

    public download = (service: string, file: string) => this.call(service, 'GET', {}, file);

    public post = (service: string, form: object = {}, json: boolean = false) => this.call(service, 'POST', form, null, json);

    public put = (service: string, form: object = {}, json: boolean = false) => this.call(service, 'PUT', form, null, json);

    public delete = (service: string, form: object = {}) => this.call(service, 'DELETE', form);

    private call(service: string, method: string, form: object = {}, file: string | null = null, json: boolean = false) {
        const _this = this;
        return new Promise((resolve: any, reject: any) => {

            // invalidate token if X-2 minutes have passed. (the default Assets token validity is 30 minutes)
            if (!_this.authTimestamp || new Date().getTime() - _this.authTimestamp.getTime() > _this.tokenValidity) {
                _this.authToken = null;
            }

            if (null === _this.authToken) {

                // first authenticate then call
                return _this.authenticate().then((data) => {
                    return _this.callSecondary(service, method, form, file, json);
                }).then((authResult: any) => {
                    resolve(authResult);
                }).catch((err: Error) => {
                    reject(err);
                });
            } else {

                // first call then authenticate if an 401 is received
                _this.callSecondary(service, method, form, file, json).then((result: any) => {
                    if (result.errorcode === 401) { // Unauthorized
                        return _this.authenticate().then((data) => {
                            return _this.callSecondary(service, method, form, file, json);
                        }).then((authResult: any) => {
                            resolve(authResult);
                        }).catch((err: Error) => {
                            reject(err);
                        });
                    }

                    return resolve(result);
                }).catch((err: Error) => {
                    reject(err);
                })
            }
        });
    }

    private authenticate = () => {
        const _this = this;

        return new Promise((resolve, reject) => {
            _this.callSecondary('/services/apilogin', 'POST', {
                username: _this.config.username,
                password: _this.config.password,
            }).then((data: AssetsLogin) => {
                if (data.loginSuccess) {
                    _this.authToken = data.authToken;
                    _this.authTimestamp = new Date();
                    return resolve(data);
                }
                return reject(data.loginFaultMessage);
            }).catch((err: Error) => {
                return reject(err);
            })
        });
    }

    private callSecondary = (service: string, method: string, form: object = {}, file: string | null = null, json: boolean = false) => {
        const _this = this;
        return new Promise((resolve: any, reject: any) => {

            const options = {
                method,
                rejectUnauthorized: _this.config.rejectUnauthorized,
                url: _this.config.serverUrl + service,
                qs: {},
                formData: {},
                json: {},
                jar: true,
                auth: {
                    bearer: (_this.authToken !== '') ? _this.authToken as string : 'something_random' // do not send an empty string, so the "Unauthorized" is not received. 400 is received instead
                }
            };

            switch (method) {
                case 'POST':
                    if (json) {
                        options.json = form;
                        delete options.formData;
                        delete options.qs;
                    } else {
                        options.formData = form;
                        delete options.json;
                        delete options.qs;
                    }
                    break;
                case 'PUT':
                    options.json = form;
                    delete options.formData;
                    delete options.qs;
                    break;
                case 'GET':
                case 'DELETE':
                    options.qs = form;
                    delete options.json;
                    delete options.formData;
                    break;
            }


            if (null !== file) {
                const fileHandle = fs.createWriteStream(file);

                const requestHandler = options.url.startsWith('https') ? https : http;
                requestHandler.get(options.url, {'headers': {'authorization': 'Bearer ' + options.auth.bearer}}, (response) => {
                    response.pipe(fileHandle);
                    fileHandle.on('finish', () => {
                        return resolve(file)
                    }).on('error', (err) => {
                        return reject(err)
                    })
                })
            } else {

                request(options, (err, response, body) => {
                    if (err) {
                        return reject(err)
                    }

                    body = _this.parseBody(body);

                    if (body && body.errorcode) {
                        response.statusCode = body.errorcode;
                        response.statusMessage = body.message;
                    }

                    if (response.statusCode === 401) {
                        return resolve(body);
                    } else if ((response.statusCode < 200 || response.statusCode > 299) && (response.statusCode !== 302)) {
                        return reject(body);
                    } else {
                        return resolve(body);
                    }
                });
            }
        });
    }

    private parseBody = (result: any) => {
        try {
            const body = (result.body) ? result.body : result;
            return (typeof body === 'string') ? JSON.parse(body) : body;
        } catch (e) {
            return result;
        }
    }
}
