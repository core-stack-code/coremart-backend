
export type OauthLoginData = {
    email: string;
    name: string;
    oauthProviderId: string;
    isEmailVerified: boolean;
    profileUrl: string | null;
}