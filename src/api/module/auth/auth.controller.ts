import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sessionService } from "@mod/session/session.service";

import { AppError, AppResponse } from "@core/utils/response";
import { GenerateOtpPayload, LoginPayload, ResendOtpPayload, SetPasswordPayload, SignupPayload, VerifyOtpPayload } from "./auth.schemas";
import { applyAuthCookies, clearAuthCookies } from "@core/utils/cookies.helper";
import { AUTH_CONFIG } from "@core/constants/authConfig";


class AuthController {
    public async login(req: Request, res: Response) {
        const payload = req.body as LoginPayload;
        const clienetType = req.clinetType;

        const { accessToken, refreshToken } = await authService.handleLogin(payload, {
            ip: req.ip,
            userAgent: req.headers['user-agent'] || "",
        });

        // Set cookies
        applyAuthCookies(res, { accessToken, refreshToken });

        const responseData = clienetType === "web" 
            ? null
            : { accessToken, refreshToken };

        AppResponse(res, 200, {
            code: "OK",
            message: "Login successful",
            data: responseData,
        });
    }


    public async signup(req: Request, res: Response) {
        const payload = req.body as SignupPayload;
        const clienetType = req.clinetType;

        const { accessToken, refreshToken } = await authService.handleSignup(payload, {
            ip: req.ip,
            userAgent: req.headers['user-agent'] || "",
        });

        // Set cookies
        applyAuthCookies(res, { accessToken, refreshToken });

        const responseData = clienetType === "web" 
            ? null
            : { accessToken, refreshToken };

        AppResponse(res, 200, {
            code: "OK",
            message: "Signup successful",
            data: responseData,
        });
    }


    public async setPassword(req: Request, res: Response) {
        const payload = req.body as SetPasswordPayload;
        const userId = req.user!.id;

        await authService.handleSetPassword(payload.password, userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Password set successfully",
        });
    }


    public async logout(req: Request, res: Response) {
        const refreshToken = req.cookies[AUTH_CONFIG.cookieName.refreshToken];

        if (!refreshToken || typeof refreshToken !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Refresh token is missing.");
        }

        await sessionService.revokeByRefreshToken(refreshToken as string);

        clearAuthCookies(res);

        AppResponse(res, 200, {
            code: "OK",
            message: "Logout successful",
        });
    }


    public async logoutAll(req: Request, res: Response) {
        const userId = req.user!.id;

        await sessionService.revokeAllSession(userId);

        clearAuthCookies(res);

        AppResponse(res, 200, {
            code: "OK",
            message: "All sessions logged out successfully",
        });
    }


    public async generateOtp(req: Request, res: Response) {
        const user = req.user!;
        const payload = req.body as GenerateOtpPayload;

        await authService.handleGenerateOtp(user, payload.sessionType);

        AppResponse(res, 200, {
            code: "OK",
            message: "OTP generated and sent successfully",
        });
    }


    public async verifyOtp(req: Request, res: Response) {
        const user = req.user!;
        const payload = req.body as VerifyOtpPayload;

        await authService.handleVerifyOtp(user, payload);

        if (payload.sessionType === "PASSWORD_RESET") {
            clearAuthCookies(res);
        }

        AppResponse(res, 200, {
            code: "OK",
            message: "OTP verified successfully",
        });
    }


    public async resentOtp(req: Request, res: Response) {
        const user = req.user!;
        const payload = req.body as ResendOtpPayload;

        await authService.handleResendOtp(user, payload.sessionType);

        AppResponse(res, 200, {
            code: "OK",
            message: "OTP resent successfully",
        });
    }
};

export const authController = new AuthController();
