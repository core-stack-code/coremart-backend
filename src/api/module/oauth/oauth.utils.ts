import { env } from "@core/config/env";
import axios from "axios";

// ---------- Constants ----------
export const GOOGLE_OAUTH = {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://openidconnect.googleapis.com/v1/userinfo"
} as const;

export const GITHUB_OAUTH = {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    emailUrl: "https://api.github.com/user/emails",
};

export const STATE_COOKIE_CONFIG = {
    name: "oauth_state",
    age: 5 * 60 * 1000, // 5 minutes
}


// ---------- Types ----------
export type OauthLoginData = {
    email: string;
    name: string;
    oauthProviderId: string;
    isEmailVerified: boolean;
}


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

export type GithubOauthApiResponse = {
    access_token: string;
    token_type: string;
    scope: string;
}

export type GitHubUserResponse = {
    login: string;
    id: number;
    node_id: string;

    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;

    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;

    type: "User" | "Organization";
    user_view_type?: "public" | "private";
    site_admin: boolean;

    name: string | null;
    company: string | null;
    blog: string;
    location: string | null;
    email: string | null;
    hireable: boolean | null;
    bio: string | null;
    twitter_username: string | null;
    notification_email: string | null;

    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;

    created_at: string;
    updated_at: string;

    private_gists?: number;
    total_private_repos?: number;
    owned_private_repos?: number;
    disk_usage?: number;
    collaborators?: number;
    two_factor_authentication?: boolean;

    plan?: {
        name: string;
        space: number;
        collaborators: number;
        private_repos: number;
    };
};

export type GitHubEmailResponse = {
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: "public" | "private" | null;
}



// ---------- Helpers ----------
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

export const exchangeGitHubCode = async (code: string): Promise<GithubOauthApiResponse> => {
    const res = await axios.post(
        GITHUB_OAUTH.tokenUrl,
        {
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
            redirect_uri: env.GITHUB_REDIRECT_URI,
        },
        {
            headers: {
                Accept: "application/json",
            },
        }
    );
    return res.data;
}


export const fetchGithubProfile = async (accessToken: string): Promise<OauthLoginData> => {
    const userRes = await axios.get<GitHubUserResponse>(GITHUB_OAUTH.userUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const emailRes = await axios.get<GitHubEmailResponse[]>(GITHUB_OAUTH.emailUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const primaryEmail = emailRes.data.find(emailObj => emailObj.primary)?.email;
    const isEmailVerified = emailRes.data.some(emailObj => emailObj.primary && emailObj.verified);

    return {
        email: primaryEmail || "",
        name: userRes.data.name || userRes.data.login,
        oauthProviderId: userRes.data.id.toString(),
        isEmailVerified,
    }
}