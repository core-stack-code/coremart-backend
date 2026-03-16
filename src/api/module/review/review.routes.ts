import express from 'express';
import { reviewController } from './review.controller';
import { createReviewSchema, updateReviewSchema } from './review.validator';

import { authMiddleware } from '@api/middlewares/auth.middleware';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { asyncWrapper } from '@api/utils/asyncWrapper';

const reviewRouter = express.Router();

reviewRouter.post(
    '/',
    authMiddleware(),
    validationMiddleware.validateRequest(createReviewSchema),
    asyncWrapper(reviewController.addReview)
);

reviewRouter.put(
    '/:reviewId',
    authMiddleware(),
    validationMiddleware.validateRequest(updateReviewSchema),
    asyncWrapper(reviewController.updateReview)
);

reviewRouter.delete(
    '/:reviewId',
    authMiddleware(),
    asyncWrapper(reviewController.deleteReview)
);

export default reviewRouter;