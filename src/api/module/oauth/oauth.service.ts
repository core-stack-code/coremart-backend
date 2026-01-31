import axios from "axios";
import crypto from "crypto";
import QueryString from "qs";

import { oauthRepository } from "./oauth.repository";
import { userRepository } from "@mod/users/user.repository";
import { sessionService } from "@mod/session/session.service";

import { env } from "@core/config/env";
import { DeviceInfo } from "@core/types/common";
import { exchangeCode, fetchProfile, GOOGLE_OAUTH, GoogleUserInfoResponse } from "./oauth.utils";
import { getUuid } from "@core/utils/db.helper";


class OAuthService {
    public getGoogleAuthUrl(): { url: string; state: string } {
        const state = crypto.randomBytes(16).toString("hex");

        const query = QueryString.stringify({
            client_id: env.GOOGLE_CLIENT_ID,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state,
            access_type: "offline",
            prompt: "consent",
        });

        return {
            url: `${GOOGLE_OAUTH.authUrl}?${query}`,
            state,
        }
    }


    public async handleGoogleCallback(code: string): Promise<GoogleUserInfoResponse> {
        const tokens = await exchangeCode(code);
        const profile = await fetchProfile(tokens.access_token);

        return profile;
    }
    

    public async loginWithGoogleOAuth(userInfo: GoogleUserInfoResponse, deviceInfo: DeviceInfo) {
        const { email, name, email_verified, sub } = userInfo;

        const existingOauth = await oauthRepository.findOauth("GOOGLE", sub);

        if (existingOauth) {
            // User already exists, create session
            return await sessionService.createSession(existingOauth.userId, deviceInfo);
        }

        let userId: string;
        const user = await userRepository.findByEmail(email);

        if (!user) {
            const newUser = await userRepository.create({
                id: getUuid(),
                name,
                email,
                isEmailVerified: email_verified,
            });
            userId = newUser.id;
        }
        else {
            userId = user.id;
        }

        await oauthRepository.create(userId, {
            id: getUuid(),
            provider: "GOOGLE",
            providerAccountId: sub,
            email,
        });

        // Create session for new user
        return await sessionService.createSession(userId, deviceInfo);
    }
}

export const oauthService = new OAuthService();