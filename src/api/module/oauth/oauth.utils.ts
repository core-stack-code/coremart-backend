
export const STATE_COOKIE_CONFIG = {
    name: "oauth_state",
    age: 5 * 60 * 1000, // 5 minutes
}

export type OauthLoginData = {
    email: string;
    name: string;
    oauthProviderId: string;
    isEmailVerified: boolean;
    profileUrl: string | null;
}