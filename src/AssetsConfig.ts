export interface AssetsConfig {
    /** Full base URL of the WoodWing Assets server */
    serverUrl: string;

    /** API username */
    username: string;

    /** API password */
    password: string;

    /** Whether to reject self-signed TLS certificates */
    rejectUnauthorized: boolean;

    /** Token validity in minutes (optional, defaults to 30) */
    tokenValidityInMinutes?: number;
}
