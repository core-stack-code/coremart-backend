import axios from "axios";
import { env } from "@core/config/env";
import { OauthLoginData } from "@mod/oauth/oauth.utils";
import { GitHubEmailResponse, GithubOauthApiResponse, GitHubUserResponse } from "./type";

export const GITHUB_OAUTH = {
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userUrl: "https://api.github.com/user",
    emailUrl: "https://api.github.com/user/emails",
} as const;


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
        profileUrl: userRes.data.avatar_url,
    }
}