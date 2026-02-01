import { NextFunction, Request, Response } from "express";
import { authService, findUserWithEmail, generateAuthTokens1, generateOrUpdateOtp, resetAuthData, verifyOtp } from "./auth.service";
import { AppError, AppResponse } from "../../../core/utils/response";
import { sendEmail } from "../../utils/snedEmail";
import { LoginPayload, SetPasswordPayload, SignupPayload } from "./auth.schemas";
import { applyAuthCookies } from "@core/utils/cookies.helper";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { sessionService } from "@mod/session/session.service";


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

        AppResponse(res, 200, {
            code: "OK",
            message: "Logout successful",
        });
    }


    public async logoutAll(req: Request, res: Response) {
        const userId = req.user!.id;

        await sessionService.revokeAllSession(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "All sessions logged out successfully",
        });
    }
}

export const authController = new AuthController();






export const verifyUserController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { otp, email, isRememberMe } = req.body
        const user = await findUserWithEmail(email)

        if(!user){
            throw new AppError(401, "UNAUTHORIZED", "Email is not registered.");
        }

        const isVerified = await verifyOtp(user._id, otp, true)

        if(!isVerified){
            throw new AppError(500, "INTERNAL_SERVER_ERROR", "Verification failed, please try again.");
        }

        const { accessToken, refreshToken } = await generateAuthTokens1(user, isRememberMe)

        // cookie name for access token
        res.cookie('__Host-atkn', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: isRememberMe ? (30 * 24 * 60 * 60 * 1000) : (60 *60 * 1000) // 60 minutes or 30 days
        });

        // cookie name for refresh token
        res.cookie('__Secure-rtkn', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        if(req.clinetType === 'web'){
            AppResponse(res, 200, {
                code: "OK",
                message: 'User verified successfully.',
                data: {
                    user: {
                        name: user.name,
                        email: user.email,
                    }
                }
            });
            return;
        }

        AppResponse(res, 200, {
            code: "OK",
            message: 'User verified successfully.',
            data: {
                atk: accessToken,
                rtk: refreshToken,
                user: {
                    name: user.name,
                    email: user.email,
                }
            }
        });

    }
    catch(error){
        next(error);
    }
}

export const forgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { email } = req.body
        const user = await findUserWithEmail(email)

        if(!user || !user.isVerified){
            throw new AppError(401, "UNAUTHORIZED", "Email is not registered.");
        }

        const otp = await generateOrUpdateOtp(user._id, "FORGOT_PASSWORD");

        await sendEmail(user.email, 'Your Verification Code', {
            name: user.name,
            otp
        }, "FORGOT_PASSWORD");

        AppResponse(res, 200, {
            code: "OK",
            message: 'Success',
        });        
    }
    catch(error){
        next(error);
    }
}

export const verifyForgotPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { otp, email } = req.body;
        const user = await findUserWithEmail(email);

        if (!user || !user.isVerified) {
            throw new AppError(401, "UNAUTHORIZED", "Email is not registered or not verified.");
        }

        const isVerified = await verifyOtp(user._id, otp, false);

        if (!isVerified) {
            throw new AppError(500, "INTERNAL_SERVER_ERROR", "Verification failed, please try again.");
        }

        AppResponse(res, 200, {
            code: "OK",
            message: 'OTP verified successfully. You may now reset your password.',
        });
    } 
    catch (error) {
        next(error);
    }
};

export const resetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const user = await findUserWithEmail(email);

        if (!user || !user.isVerified) {
            throw new AppError(401, "UNAUTHORIZED", "Email is not registered or not verified.");
        }

        user.password = password;
        await user.save();
        await resetAuthData(user._id);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Password reset successfully.',
        });
    } 
    catch (error) {
        next(error);
    }
}