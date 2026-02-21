import axios from "axios";
import { GoogleOauthApiResponse, GoogleUserInfoResponse } from "./type";
import { env } from "@core/config/env";

export const GOOGLE_OAUTH = {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo"
} as const;


export const exchangeGoogleCode = async (code: string): Promise<GoogleOauthApiResponse> => {
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

export const fetchGoogleProfile = async (accessToken: string): Promise<GoogleUserInfoResponse> => {
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