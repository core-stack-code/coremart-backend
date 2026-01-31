import User, { IUser } from "../users/user.model";
import Auth from "./auth.model";
import { env } from "../../../core/config/env";
import { SignupPayload } from "./auth.schemas";
import { generateOTP } from "../../utils/helper";
import { AppError } from "../../../core/utils/response";
import { generateJwtToken } from "../../../core/lib/jwt";

type OtpContext = 'VERIFY_EMAIL' | 'FORGOT_PASSWORD';

export const checkAndRegisterUser = async (userData: SignupPayload) => {
    const existedUser = await User.findOne({ email: userData.email })

    if (existedUser) {
        if (existedUser.isVerified) {
            throw new AppError(400, "BAD_REQUEST", "User already exists and is verified");
        }

        return existedUser;
    }

    const user = new User(userData);
    await user.save();
    return user;
}

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

export const checkCredential = async (password: string, user: IUser) => {
    const isPasswordMatch = await user.comparePassword(password)
    if(!isPasswordMatch){
        throw new AppError(400, "BAD_REQUEST", "Invalid user credentials.");
    }

    return true
}

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