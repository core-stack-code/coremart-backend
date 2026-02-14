import { env } from "@core/config/env";
import { randomUUID } from "crypto";
import { AdminLoginPayload, AdminPayload } from "./admin.validator";
import { adminRepository } from "./admin.repository";

import { generateJwtToken, verifyJwtToken } from "@core/lib/jwt";
import { comparePassword, generatePasswordHash } from "@core/lib/passsword";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { AppError } from "@core/utils/response";
import { TokensResponse } from "@core/types/common";
import { ChangePasswordPayload } from "@core/validator/password.validator";

export type AdminResponse = {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}


class AdminService {
    public async loginAdmin(payload: AdminLoginPayload): Promise<{ admin: AdminResponse, tokens: TokensResponse }> {
        const admin = await adminRepository.findByEmail(payload.email);

        if (!admin) {
            throw new AppError(400, "BAD_REQUEST", "Invalid admin credentials.");
        }

        const isValidPassword = await comparePassword(payload.password, admin.password);

        if (!isValidPassword) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid admin credentials.");
        }

        const tokens = this.generateAdminTokens(admin.id);

        // update refresh token in database
        await adminRepository.updateRefreshToken(admin.id, tokens.refreshToken);

        return { 
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt,
            },
            tokens 
        };
    }

    public async logoutAdmin(adminId: string) {
        await adminRepository.updateRefreshToken(adminId, null);
    }

    public async changePassword(adminId: string, payload: ChangePasswordPayload) {
        const admin = await adminRepository.findById(adminId);

        if (!admin) {
            throw new AppError(400, "BAD_REQUEST", "Invalid credentials.");
        }

        const isValidPassword = await comparePassword(payload.currentPassword, admin.password);

        if (!isValidPassword) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid credentials.");
        }

        const isSamePassword = await comparePassword(payload.newPassword, admin.password);

        if (isSamePassword) {
            throw new AppError(
                400, 
                "BAD_REQUEST", 
                "New password must be different from the current password."
            );
        }

        const newPasswordHash = await generatePasswordHash(payload.newPassword);
        await adminRepository.updatePassword(adminId, newPasswordHash);

        // Clear refresh token to logout from all devices
        await adminRepository.updateRefreshToken(adminId, null);
    }

    public async refreshToken(oldRefreshToken: string) {
        const decode = verifyJwtToken(oldRefreshToken, env.ADMIN_REFRESH_SECRET);

        if (!decode || typeof decode.sub !== "string") {
            throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token.");
        }

        const admin = await adminRepository.findById(decode.sub);

        if (!admin) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token.");
        }

        const tokens = this.generateAdminTokens(admin.id);

        // Update refresh token in database
        await adminRepository.updateRefreshToken(admin.id, tokens.refreshToken);

        return tokens;
    }

    private generateAdminTokens(adminId: string) {
        const accessToken = generateJwtToken({
            sub: adminId,
        }, env.ADMIN_ACCESS_SECRET, AUTH_CONFIG.jwtExpiry.accessToken);
        
        const refreshToken = generateJwtToken({
            sub: adminId,
            jti: randomUUID(),
        }, env.ADMIN_REFRESH_SECRET, AUTH_CONFIG.jwtExpiry.refreshToken);
        
        return { accessToken, refreshToken };
    }

    public async registerAdmin(payload: AdminPayload): Promise<{ admin: AdminResponse, tokens: TokensResponse }> {
        const adminCount = await adminRepository.count();

        if (adminCount > 0) {
            throw new AppError(409, "CONFLICT", "Admin already exists");
        }

        const passwordHash = await generatePasswordHash(payload.password);

        const admin = await adminRepository.createAdmin({
            email: payload.email,
            name: payload.name,
            password: passwordHash,
        });

        const tokens = this.generateAdminTokens(admin.id);

        // update refresh token in database
        await adminRepository.updateRefreshToken(admin.id, tokens.refreshToken);

        return { admin, tokens };
    }
}

export const adminService = new AdminService();