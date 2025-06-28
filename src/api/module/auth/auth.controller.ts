import { NextFunction, Request, Response } from "express";
import { checkAndRegisterUser, checkCredential, findUserWithEmail, generateAuthTokens, generateOrUpdateOtp, resetAuthData, verifyOtp } from "./auth.service";
import { CustomError, successResponse } from "../../utils/response";
import { sendEmail } from "../../utils/snedEmail";

export const signUpController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await checkAndRegisterUser(req.body);
        const otp = await generateOrUpdateOtp(user._id, "VERIFY_EMAIL");

        await sendEmail(user.email, 'Your Verification Code', {
            name: user.name,
            otp
        }, "VERIFY_EMAIL");

        successResponse(res, {
            status: 200,
            message: 'Success',
        });
    } 
    catch (error) {
        next(error); 
    }
}

export const verifyUserController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { otp, email, isRememberMe } = req.body
        const user = await findUserWithEmail(email)

        if(!user){
            throw new CustomError("Email is not register.", 401)
        }

        const isVerified = await verifyOtp(user._id, otp, true)

        if(!isVerified){
            throw new CustomError("Verification faild, please try agin.", 500)
        }

        const { accessToken, refreshToken } = await generateAuthTokens(user, isRememberMe)

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
            successResponse(res, {
                status: 200,
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

        successResponse(res, {
            status: 200,
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

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const { email, password, isRememberMe } = req.body
        const user = await findUserWithEmail(email)

        if(!user || !user.isVerified){
            throw new CustomError("Email is not register.", 401)
        }

        await checkCredential(password, user)

        const { accessToken, refreshToken } = await generateAuthTokens(user, isRememberMe)

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
            successResponse(res, {
                status: 200,
                message: "Success",
                data: {
                    user: {
                        name: user.name,
                        email: user.email,
                    }
                }
            })
            return;
        }

        successResponse(res, {
            status: 200,
            message: "Success",
            data: {
                atk: accessToken,
                rtk: refreshToken,
                user: {
                    name: user.name,
                    email: user.email,
                }
            }
        })
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
            throw new CustomError("Email is not register.", 401)
        }

        const otp = await generateOrUpdateOtp(user._id, "FORGOT_PASSWORD");

        await sendEmail(user.email, 'Your Verification Code', {
            name: user.name,
            otp
        }, "FORGOT_PASSWORD");

        successResponse(res, {
            status: 200,
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
            throw new CustomError("Email is not registered or not verified.", 400);
        }

        const isVerified = await verifyOtp(user._id, otp, false);

        if (!isVerified) {
            throw new CustomError("Verification failed, please try again.", 400);
        }

        successResponse(res, {
            status: 200,
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
            throw new CustomError("Email is not registered or not verified.", 400);
        }

        user.password = password;
        await user.save();
        await resetAuthData(user._id);

        successResponse(res, {
            status: 200,
            message: 'Password reset successfully.',
        });
    } 
    catch (error) {
        next(error);
    }
}
