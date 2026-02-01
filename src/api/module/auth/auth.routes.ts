import express from 'express';
import { forgotPasswordSchema, loginZodSchema, resetPasswordSchema, setPasswordZodSchema, signupZodSchema, verifySchema } from './auth.schemas';
import { validateRequest, validationMiddleware } from '../../middlewares/validate.middlewate';
import { 
    authController,
    forgotPasswordController,
    resetPasswordController,
    verifyForgotPasswordController,
    verifyUserController 
} from './auth.controller';
import { detectClient } from '../../middlewares/detectClient.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';
import { authMiddleware } from '@api/middlewares/auth.middleware';

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
    authMiddleware,
    validationMiddleware.validateRequest(setPasswordZodSchema),
    asyncWrapper(authController.setPassword)
);

authRouter.post(
    '/logout',
    authMiddleware,
    asyncWrapper(authController.logout)
)

authRouter.post(
    '/logout-all',
    authMiddleware,
    asyncWrapper(authController.logoutAll)
)


// old routes to be removed after refactoring
authRouter.post(
    '/verify',
    detectClient,
    validateRequest(verifySchema),
    verifyUserController
);


authRouter.post(
    '/forgot_password',
    validateRequest(forgotPasswordSchema),
    forgotPasswordController
)

authRouter.post(
    '/verify_forgot_password',
    validateRequest(verifySchema), 
    verifyForgotPasswordController
);

authRouter.post(
    '/reset_password',
    validateRequest(resetPasswordSchema),
    resetPasswordController
);

export default authRouter;
