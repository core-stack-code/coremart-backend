import { env } from "@core/config/env";
import axios from "axios";

// ---------- Constants ----------
export const GOOGLE_OAUTH = {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo"
} as const;


// ---------- Types ----------
export type GoogleOauthApiResponse = {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
    id_token: string;
}

export type GoogleUserInfoResponse = {
    sub: string;
    name: string;
    given_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
}


// ---------- Helpers ----------
export const exchangeCode = async (code: string): Promise<GoogleOauthApiResponse> => {
    const res = await axios.post<GoogleOauthApiResponse>(
        GOOGLE_OAUTH.tokenUrl,
        {
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            code,
            grant_type: "authorization_code",
        }, 
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    );
    return res.data;
}

export const fetchProfile = async (accessToken: string): Promise<GoogleUserInfoResponse> => {
    const res = await axios.get<GoogleUserInfoResponse>(
        GOOGLE_OAUTH.userInfoUrl,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        }
    );
    return res.data;
}