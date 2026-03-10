import express from 'express';
import { authController } from './auth.controller';
import {
    generateOtpZodSchema,
    loginZodSchema,
    resendOtpZodSchema,
    setPasswordZodSchema,
    signupZodSchema,
    verifyOtpZodSchema
} from './auth.validator';
import { asyncWrapper } from '@core/utils/asyncWrapper';

import { authMiddleware } from '@api/middlewares/auth.middleware';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { identityMiddleware } from '@api/middlewares/identity.middleware';
import { changePasswordZodSchema } from '@core/validator/password.validator';
import { rateLimitMiddleware } from '@api/middlewares/ratelimit.middleware';

const authRouter = express.Router();

authRouter.post(
    '/login',
    identityMiddleware.detectClient,
    validationMiddleware.validateRequest(loginZodSchema),
    asyncWrapper(authController.login)
);

authRouter.post(
    '/signup',
    identityMiddleware.detectClient,
    validationMiddleware.validateRequest(signupZodSchema),
    asyncWrapper(authController.signup)
);

authRouter.post(
    '/set-password',
    authMiddleware(),
    validationMiddleware.validateRequest(setPasswordZodSchema),
    asyncWrapper(authController.setPassword)
);

authRouter.post(
    '/change-password',
    authMiddleware(),
    validationMiddleware.validateRequest(changePasswordZodSchema),
    asyncWrapper(authController.changePassword)
)

authRouter.post(
    '/refresh-token',
    identityMiddleware.detectClient,
    asyncWrapper(authController.refreshTokens)
)

authRouter.post(
    '/logout',
    authMiddleware(),
    asyncWrapper(authController.logout)
)

authRouter.post(
    '/logout-all',
    authMiddleware(),
    asyncWrapper(authController.logoutAll)
)

authRouter.post(
    '/otp/generate',
    authMiddleware({ requireEmailVerified: false }),
    rateLimitMiddleware.otpRateLimit,
    validationMiddleware.validateRequest(generateOtpZodSchema),
    asyncWrapper(authController.generateOtp)
)

authRouter.post(
    '/otp/verify',
    authMiddleware({ requireEmailVerified: false }),
    validationMiddleware.validateRequest(verifyOtpZodSchema),
    asyncWrapper(authController.verifyOtp)
)

authRouter.post(
    '/otp/resend',
    authMiddleware({ requireEmailVerified: false }),
    rateLimitMiddleware.otpRateLimit,
    validationMiddleware.validateRequest(resendOtpZodSchema),
    asyncWrapper(authController.resentOtp)
)

export default authRouter;
