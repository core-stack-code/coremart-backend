import User, { IUser } from "../users/user.model";
import Auth from "./auth.model";
import { env } from "../../../core/config/env";
import { LoginPayload, SignupPayload } from "./auth.schemas";
import { generateOTP } from "../../utils/helper";
import { AppError } from "../../../core/utils/response";
import { generateJwtToken } from "../../../core/lib/jwt";
import { userRepository } from "@mod/users/user.repository";
import { passwordService } from "@mod/password/password.service";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { sessionService } from "@mod/session/session.service";
import { passwordRepository } from "@mod/password/password.repository";
import { getUuid } from "@core/utils/db.helper";


class AuthService {
    public async handleLogin(
        payload: LoginPayload, 
        deviceInfo: DeviceInfo
    ): Promise<TokensResponse>  {
        const user = await userRepository.findByEmail(payload.email);

        if (!user) {
            throw new AppError(400, "BAD_REQUEST", "Invalid user credentials.");
        }

        await passwordService.validatePassword(user.id, payload.password);

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

        await passwordService.addPasswrod(userId, payload.password);

        return await sessionService.createSession(userId, deviceInfo);
    }


    public async handleSetPassword(password: string, userId: string): Promise<void> {
        const passwordCredential = await passwordRepository.findByUserId(userId);

        if (passwordCredential) {
            throw new AppError(400, "BAD_REQUEST", "Password is already set.");
        }

        await passwordService.addPasswrod(userId, password);
    }
}

export const authService = new AuthService();








type OtpContext = 'VERIFY_EMAIL' | 'FORGOT_PASSWORD';


export const generateOrUpdateOtp = async (userId: unknown, context: OtpContext): Promise<number> => {
    const otp = generateOTP();
    const auth = await Auth.findOne({ userId });

    if (!auth) {
        if (context === 'FORGOT_PASSWORD') {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "User not found.");
        }

        const newAuth = new Auth({
            userId,
            otpCode: otp,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        });
        await newAuth.save();
        return otp;
    }

    if (auth.resendCount <= 0) {
        throw new AppError(403, "FORBIDDEN", "You have reached the maximum resend limit.");
    }

    auth.otpCode = otp;
    auth.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    auth.resendCount -= 1;
    await auth.save();

    return otp;
};

export const findUserWithEmail = async (email: string) => {
    return await User.findOne({ email })
}

export const verifyOtp = async (userId: unknown, otp: number, markUserVerified: boolean = false): Promise<boolean> => {
    const auth = await Auth.findOne({ userId });
    if (!auth) return false;

    const now = Date.now();
    if (!auth.expiresAt || now > auth.expiresAt.getTime()) {
        throw new AppError(401, "UNAUTHORIZED", "Session has expired.");
    }

    if (auth.otpCode !== otp) {
        throw new AppError(401, "UNAUTHORIZED", "Incorrect otp.");
    }

    auth.otpCode = null;
    auth.expiresAt = null;
    auth.resendCount = 3;
    await auth.save();

    if (markUserVerified) {
        const user = await User.findById(userId);
        if (!user) return false;

        user.isVerified = true;
        await user.save();
    }

    return true;
};


export const resetAuthData = async (userId: unknown) => {
    const auth = await Auth.findOne({ userId });
    if (!auth) return;

    auth.otpCode = null;
    auth.expiresAt = null;
    auth.resendCount = 3;
    await auth.save();
}

export const generateAuthTokens1 = async (user: IUser, isRememberMe: boolean) => {
    const accessToken = generateJwtToken({
        sub: user._id,
        email: user.email,
    }, env.JWT_ACCESS_SECRET, isRememberMe ? '30d': '1h');

    const refreshToken = generateJwtToken({
        sub: user._id,
        email: user.email,
    }, env.JWT_REFRESH_SECRET, '30d');

    return { accessToken, refreshToken };
}