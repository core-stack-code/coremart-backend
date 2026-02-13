import express from 'express';
import { mediaController } from './media.controller';
import { mediaSchema } from './media.validator';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';

const mediaRouter = express.Router();

mediaRouter.post(
    '/signature',
    validationMiddleware.validateRequest(mediaSchema),
    mediaController.generateSignature
)

export default mediaRouter;