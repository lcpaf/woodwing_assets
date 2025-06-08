export interface AssetsLogin {
    /** Indicates if the login was successful */
    loginSuccess: boolean;

    /** Message describing the login failure (if any) */
    loginFaultMessage: string;

    /** Version string returned by the server */
    serverVersion: string;

    /** Auth token for subsequent API requests (null if login failed) */
    authToken: string | null;
}
