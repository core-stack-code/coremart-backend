
import User, { IUser } from "../users/user.model";
import Auth from "./auth.model";
import { generateOTP } from "../../utils/helper";
import { CustomError } from "../../utils/response";
import { LoginPayload, SignupPayload } from "./auth.schemas";
import { env } from "../../config/env";
import { generateJwtToken } from "../../utils/jwt";

type OtpContext = 'VERIFY_EMAIL' | 'FORGOT_PASSWORD';

export const checkAndRegisterUser = async (userData: SignupPayload) => {
    const existedUser = await User.findOne({ email: userData.email })

    if (existedUser) {
        if (existedUser.isVerified) {
            throw new CustomError('User already exists and is verified', 400);
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
            throw new CustomError("User not found.", 404);
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
        throw new CustomError("You have reached the maximum resend limit.", 403);
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
        throw new CustomError("Session has expired.", 401);
    }

    if (auth.otpCode !== otp) {
        throw new CustomError("Incorrect otp.", 401);
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

export const checkCredential = async (payload: LoginPayload, user: IUser) => {
    const isPasswordMatch = await user.comparePassword(payload.password)
    if(!isPasswordMatch){
        throw new CustomError("Invalid user credentials.", 400)
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

export const generateAuthTokens = async (user: IUser) => {
    const accessToken = generateJwtToken({
        sub: user._id,
        email: user.email,
    }, env.JWT_ACCESS_SECRET, '1h');

    const refreshToken = generateJwtToken({
        sub: user._id,
        email: user.email,
    }, env.JWT_REFRESH_SECRET, '30d');

    return { accessToken, refreshToken };
}