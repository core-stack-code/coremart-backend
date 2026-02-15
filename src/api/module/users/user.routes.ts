import express from 'express';
import { authMiddleware } from '@api/middlewares/auth.middleware';
import { userController } from './user.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { updateUserSchema } from './user.validator';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const userRouter = express.Router();

userRouter.get(
    '/profile',
    authMiddleware(),
    asyncWrapper(userController.getProfile)
)

userRouter.patch(
    '/profile',
    authMiddleware(),
    validationMiddleware.validateRequest(updateUserSchema),
    asyncWrapper(userController.updateProfile)
)

export default userRouter;