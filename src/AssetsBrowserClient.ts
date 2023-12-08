import Promise = require("bluebird");

export class AssetsBrowserClient {

    private apiClient: any;

    constructor(apiClient: any) {
        this.apiClient = apiClient;
    }
}