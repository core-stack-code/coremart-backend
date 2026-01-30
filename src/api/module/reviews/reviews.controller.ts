import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { addReview, deleteReview, updateReview, updateReviewState } from "./reviews.service";
import { Types } from "mongoose";
import { AppResponse } from "../../../core/utils/response";


export const addReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const payload = req.body
        const userId = new Types.ObjectId(req.auth.userId);
        const review = await addReview(userId, payload);
        

        AppResponse(res, 201, {
            code: "CREATED",
            message: 'Review added succesfully.',
            data: { review }
        });
    }
    catch (error) {
        next(error)
    }
}

export const updateReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviewId = new Types.ObjectId(req.params.reviewId);
        const review = await updateReview(reviewId, req.body);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Review state updated successfully.',
            data: { review }
        });
    }
    catch (error) {
        next(error)
    }
}

export const deleteReviewController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reviewId = new Types.ObjectId(req.params.reviewId);
        await deleteReview(reviewId);


        AppResponse(res, 200, {
            code: "OK",
            message: 'Review deleted successfully.',
            data: null
        });
    }
    catch (error) {
        next(error)
    }
}