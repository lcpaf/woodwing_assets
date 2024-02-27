import Promise = require("bluebird");
import {AssetsServerBase} from "./AssetsServerBase";

export class AssetsServerAdmin extends AssetsServerBase {

    public currentState = (): Promise<unknown> => {
        return this.post('/controller/admin/activation/currentState');
    };

    public activeUsers = (): Promise<unknown> => {
        return this.get('/private-api/system/active-users');
    };
}
