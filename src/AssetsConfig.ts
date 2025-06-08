export interface AssetsConfig {
    serverUrl: string;
    username: string;
    password: string;
    rejectUnauthorized: boolean;
    tokenValidityInMinutes?: number;
}
