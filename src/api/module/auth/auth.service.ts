import { sessionService } from "@mod/session/session.service";
import { passwordService } from "@mod/password/password.service";
import { userRepository } from "@mod/users/user.repository";
import { passwordRepository } from "@mod/password/password.repository";

import { AppError } from "@core/utils/response";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { getUuid } from "@core/utils/db.helper";
import { ChangePasswordPayload, LoginPayload, SignupPayload } from "./auth.validator";


class AuthService {
    public async handleLogin(
        payload: LoginPayload, 
        deviceInfo: DeviceInfo
    ): Promise<TokensResponse>  {
        const user = await userRepository.findByEmail(payload.email);

        if (!user) {
            throw new AppError(400, "BAD_REQUEST", "Invalid user credentials.");
        }

        const passwordCredential = await passwordService.findPasswordByUserId(user.id);

        await passwordService.validatePassword(
            payload.password,
            passwordCredential.passwordHash
        );

        return await sessionService.createSession(user.id, deviceInfo);
    }


    public async handleSignup(
        payload: SignupPayload, 
        deviceInfo: DeviceInfo
    ): Promise<TokensResponse> {
        const existedUser = await userRepository.findByEmail(payload.email);
        let userId: string;

        if (existedUser) {
            userId = existedUser.id; 
            const passwordCredential = await passwordRepository.findByUserId(existedUser.id);

            if (passwordCredential) {
                throw new AppError(400, "BAD_REQUEST", "User already exists.");
            }
        }
        else {
            const newUser = await userRepository.create({
                id: getUuid(),
                name: payload.name,
                email: payload.email,
                isEmailVerified: false,
            });
    
            userId = newUser.id;
        }

        await passwordService.addPassword(userId, payload.password);

        return await sessionService.createSession(userId, deviceInfo);
    }


    public async handleSetPassword(password: string, userId: string): Promise<void> {
        const passwordCredential = await passwordRepository.findByUserId(userId);

        if (passwordCredential) {
            throw new AppError(400, "BAD_REQUEST", "Password is already set.");
        }

        await passwordService.addPassword(userId, password);
    }


    public async handleChangePassword(userId: string, payload: ChangePasswordPayload): Promise<void> {
        const passwordCredential = await passwordService.findPasswordByUserId(userId);

        await passwordService.validatePassword(
            payload.currentPassword,
            passwordCredential.passwordHash
        );

        await passwordService.isSamePassword(
            payload.newPassword!, 
            passwordCredential.passwordHash
        );

        await passwordService.updatePassword(userId, payload.newPassword);
    }
}

export const authService = new AuthService();
