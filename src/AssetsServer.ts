import {AssetsConfig} from "./AssetsConfig";
import {AssetsLogin} from "./AssetsLogin";
import Promise = require("bluebird");
import request = require('request');

export class AssetsServer {

    private readonly config: AssetsConfig;
    private authToken: string | null;

    constructor(config: AssetsConfig) {
        this.config = config;
        this.authToken = '';
    }

    public authenticate() {
        const _this = this;

        return new Promise((resolve, reject) => {
            _this.callSecondary('/services/apilogin', 'POST', {
                username: _this.config.username,
                password: _this.config.password,
            }).then((data: AssetsLogin) => {
                if (data.loginSuccess) {
                    _this.authToken = data.authToken;
                    return resolve(data);
                }
                return reject(data.loginFaultMessage);
            }).catch((err: Error) => {
                return reject(err);
            })
        });
    }

    public get = (service: string, form: object = {}) => this.call(service, 'GET', form);

    public post = (service: string, form: object = {}) => this.call(service, 'POST', form);

    public put = (service: string, form: object = {}) => this.call(service, 'PUT', form);

    public delete = (service: string, form: object = {}) => this.call(service, 'DELETE', form);

    private call(service: string, method: string, form: object = {}) {
        const _this = this;

        return new Promise((resolve: any, reject: any) => {
            _this.callSecondary(service, method, form).then((result: any) => {
                if (result.errorcode === 401) { // Unauthorized

                    return _this.authenticate().then((data) => {
                        return _this.callSecondary(service, method, form);
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
        });
    }

    private callSecondary(service: string, method: string, form: object = {}) {
        const _this = this;
        return new Promise((resolve: any, reject: any) => {

            const options = {
                method,
                rejectUnauthorized: _this.config.rejectUnauthorized,
                url: _this.config.serverUrl + service,
                qs: {},
                formData: {},
                jar: true,
                auth: {
                    bearer: (_this.authToken !== '') ? _this.authToken as string : 'something_random' // do not send a empty string, so the "Unauthorized" is not received. 400 is received instead
                }
            };

            switch (method) {
                case 'POST':
                case 'PUT':
                    options.formData = form;
                    break;
                case 'GET':
                case 'DELETE':
                    options.qs = form;
                    break;
            }

            request(options, (err, response, body) => {
                if (err) {
                    return reject(err)
                }

                body = AssetsServer.parseBody(body);

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
        });
    }

    private static parseBody(result: any) {
        try {
            const body = (result.body) ? result.body : result;
            return (typeof body === 'string') ? JSON.parse(body) : body;
        } catch (e) {
            return result;
        }
    }
}