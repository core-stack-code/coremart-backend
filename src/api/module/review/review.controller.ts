import { Request, Response } from "express";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.validator";
import { reviewService } from "./review.service";
import { AppResponse } from "@api/utils/response";

class ReviewController {
    public async addReview(req: Request, res: Response) {
        const userId = req.user!.id;
        const payload = req.body as CreateReviewPayload;

        await reviewService.handleCreate(userId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Review created successfully.",
        });
    }

    public async updateReview(req: Request, res: Response) {
        const userId = req.user!.id;
        const reviewId= req.params.reviewId;
        const payload = req.body as UpdateReviewPayload;

        await reviewService.handleUpdate(userId, reviewId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Review updated successfully.",
        });
    }

    public async deleteReview(req: Request, res: Response) {
        const userId = req.user!.id;
        const reviewId= req.params.reviewId;

        await reviewService.handleDelete(userId, reviewId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Review deleted successfully.",
        });
    }
}

export const reviewController = new ReviewController();