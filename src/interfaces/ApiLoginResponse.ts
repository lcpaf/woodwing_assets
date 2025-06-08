export interface ApiLoginResponse {
    loginSuccess: boolean;
    loginFaultMessage: string;
    serverVersion: string;
    authToken: string | null;
}
