import express from 'express';
import { mediaController } from './media.controller';
import { mediaSchema } from './media.validator';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@api/utils/asyncWrapper';

const mediaRouter = express.Router();

mediaRouter.post(
    '/signature',
    adminMiddleware,
    validationMiddleware.validateRequest(mediaSchema),
    asyncWrapper(mediaController.generateSignature)
);

export default mediaRouter;