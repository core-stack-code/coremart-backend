import express from 'express';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, verifySchema } from './auth.schemas';
import { validateRequest } from '../../middlewares/validate.middlewate';
import { 
    forgotPasswordController,
    loginController,
    resetPasswordController,
    signUpController,
    verifyForgotPasswordController,
    verifyUserController 
} from './auth.controller';
import { detectClient } from '../../middlewares/detectClient.middleware';

const authRouter = express.Router();

authRouter.post(
    '/signup',
    validateRequest(signupSchema),
    signUpController
);

authRouter.post(
    '/verify',
    detectClient,
    validateRequest(verifySchema),
    verifyUserController
);

authRouter.post(
    '/login',
    detectClient,
    validateRequest(loginSchema),
    loginController
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
