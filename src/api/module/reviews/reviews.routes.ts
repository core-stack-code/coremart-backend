import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middlewate";
import { addReviewSchema, updateReviewSchema } from "./reviews.schema";
import { addReviewController, deleteReviewController, updateReviewController } from "./reviews.controller";

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateRequest(addReviewSchema),
    addReviewController
)

router.patch(
    '/:reviewId',
    authMiddleware,
    validateRequest(updateReviewSchema),
    updateReviewController
)

router.delete(
    '/:reviewId',
    authMiddleware,
    deleteReviewController
)

export default router;