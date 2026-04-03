import { Request, Response } from "express";
import { AdminLoginPayload, AdminPayload, UpdateAdminProfilePayload } from "./admin.validator";
import { AdminResponse, adminService } from "./admin.service";

import { AppError, AppResponse } from "@api/utils/response";
import { applyAuthCookies, clearAuthCookies } from "@core/utils/cookies.helper";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { ChangePasswordPayload } from "@core/validator/password.validator";


class AdminController {
    public async loginAdmin(req: Request, res: Response) {
        const payload = req.body as AdminLoginPayload;

        const { admin, tokens } = await adminService.loginAdmin(payload);

        applyAuthCookies(res, tokens, 'admin');

        if (admin.isDemo) {
            throw new AppError(403, "FORBIDDEN", "Demo admin is not allowed to perform this action.");
        }

        AppResponse(res, 200, {
            code: "OK",
            message: "Login successful",
            data: admin,
        });
    }

    public async logoutAdmin(req: Request, res: Response) {
        const adminId = req.admin!.id;

        await adminService.logoutAdmin(adminId);

        clearAuthCookies(res, 'admin');

        AppResponse(res, 200, {
            code: "OK",
            message: "Logout successful",
        });
    }

    public async changePassword(req: Request, res: Response) {
        const adminId = req.admin!.id;
        const payload = req.body as ChangePasswordPayload;

        await adminService.changePassword(adminId, payload);

        clearAuthCookies(res, 'admin');

        AppResponse(res, 200, {
            code: "OK",
            message: "Password changed successfully",
        });
    }

    public async refreshToken(req: Request, res: Response) {
        const refreshToken = req.cookies[AUTH_CONFIG.adminCookiesName.refreshToken];

        if (!refreshToken || typeof refreshToken !== "string") {
            throw new AppError(401, "UNAUTHORIZED", "Token is missing.");
        }

        const tokens = await adminService.refreshToken(refreshToken);

        applyAuthCookies(res, tokens, 'admin');

        AppResponse(res, 200, {
            code: "OK",
            message: "Tokens refreshed successfully",
            data: null,
        });
    }

    public async getProfile(req: Request, res: Response) {
        const admin = req.admin!;

        const result: AdminResponse = {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            imageUrl: admin.imageUrl,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            isDemo: admin.isDemo,
        }

        AppResponse(res, 200, {
            code: "OK",
            message: "Profile fetched successfully",
            data: result,
        });
    }

    public async updateProfile(req: Request, res: Response) {
        const adminId = req.admin!.id;
        const payload = req.body as UpdateAdminProfilePayload;

        const result = await adminService.updateProfile(adminId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Profile updated successfully",
            data: result,
        });
    }

    public async registerAdmin(req: Request, res: Response) {
        const payload = req.body as AdminPayload;

        const { admin, tokens } = await adminService.registerAdmin(payload);

        applyAuthCookies(res, tokens, 'admin');

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Admin registered successfully",
            data: admin,
        });
    }

    public async guestLogin(_req: Request, res: Response) {
        const payload = {
            email: "admindemo@coremart.com",
            password: "demo1234A@demo"
        }

        const { admin, tokens } = await adminService.loginAdmin(payload);

        applyAuthCookies(res, tokens, 'admin');

        AppResponse(res, 200, {
            code: "OK",
            message: "Login successful",
            data: admin,
        });
    }
}

export const adminController = new AdminController();