import {AssetsServerBase} from './AssetsServerBase';

export class AssetsServerAdmin extends AssetsServerBase {
    public async currentState(): Promise<unknown> {
        return this.post('/controller/admin/activation/currentState');
    }

    public async activeUsers(): Promise<unknown> {
        return this.get('/private-api/system/active-users');
    }
}
