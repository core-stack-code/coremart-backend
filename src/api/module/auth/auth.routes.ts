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

const router = express.Router();

router.post(
    '/signup',
    validateRequest(signupSchema),
    signUpController
);

router.post(
    '/verify',
    detectClient,
    validateRequest(verifySchema),
    verifyUserController
);

router.post(
    '/login',
    detectClient,
    validateRequest(loginSchema),
    loginController
);

router.post(
    '/forgot_password',
    validateRequest(forgotPasswordSchema),
    forgotPasswordController
)

router.post(
    '/verify_forgot_password',
    validateRequest(verifySchema), 
    verifyForgotPasswordController
);

router.post(
    '/reset_password',
    validateRequest(resetPasswordSchema),
    resetPasswordController
);

export default router;
