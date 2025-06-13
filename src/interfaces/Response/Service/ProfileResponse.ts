export interface ProfileResponse {
    username: string;
    fullName: string;
    email: string | null;
    locale: string | null;
    authorities: string[];
    userZone: string | null;
    groups: string[];
}
