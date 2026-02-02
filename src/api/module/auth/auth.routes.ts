import express from 'express';
import { authController } from './auth.controller';
import { 
    generateOtpZodSchema,
    loginZodSchema,
    resendOtpZodSchema,
    setPasswordZodSchema,
    signupZodSchema,
    verifyOtpZodSchema
} from './auth.schemas';
import { asyncWrapper } from '@core/utils/asyncWrapper';

import { authMiddleware } from '@api/middlewares/auth.middleware';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { detectClient } from '@api/middlewares/detectClient.middleware';

const authRouter = express.Router();

authRouter.post(
    '/login',
    detectClient,
    validationMiddleware.validateRequest(loginZodSchema),
    asyncWrapper(authController.login)
);

authRouter.post(
    '/signup',
    detectClient,
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
    validationMiddleware.validateRequest(resendOtpZodSchema),
    asyncWrapper(authController.resentOtp)
)

export default authRouter;
