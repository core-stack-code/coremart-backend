import express from 'express';
import { userController } from './user.controller';
import { updateUserSchema } from './user.validator';

import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { authMiddleware } from '@api/middlewares/auth.middleware';
import { asyncWrapper } from '@api/utils/asyncWrapper';

const userRouter = express.Router();

userRouter.get(
    '/profile',
    authMiddleware({ requireEmailVerified: false }),
    asyncWrapper(userController.getProfile)
)

userRouter.patch(
    '/',
    authMiddleware({ requireEmailVerified: false }),
    validationMiddleware.validateRequest(updateUserSchema),
    asyncWrapper(userController.updateProfile)
)

export default userRouter;