import { Types } from "mongoose"
import { Review } from "./reviews.modal"
import { Product } from "../products/products.modal"
import { AddReviewType, UpdateReviewType } from "./reviews.schema";
import { CustomError } from "../../utils/response";
import { de } from "@faker-js/faker/.";

export const updateReviewState = async (productId: Types.ObjectId) => {
    const [state] = await Review.aggregate([
        { $match: { productId } },
        {
            $group: {
                _id: '$productId',
                numReviews: { $sum: 1 },
                avgReview: { $avg: '$rating' }
            }
        }
    ]);

    const update = state
        ? { numReviews: state.numReviews, rating: state.avgReview }
        : { numReviews: 0, rating: 0 };

    await Product.findByIdAndUpdate(productId, update);
}

export const addReview = async (userId: Types.ObjectId, payload: AddReviewType) => {
    const reviewData  = {
        ...payload,
        userId,
    }

    const addedReview = await Review.create(reviewData);
    await updateReviewState(new Types.ObjectId(payload.productId));

    return addedReview.toObject();
}

export const updateReview = async (reviewId: Types.ObjectId, payload: UpdateReviewType) => {
    const updatedReview = await Review.findByIdAndUpdate(reviewId, payload, { new: true });

    if (!updatedReview) {
        throw new CustomError("Review not found", 404);
    }

    await updateReviewState(new Types.ObjectId(updatedReview.productId));
    return updatedReview.toObject();
}

export const deleteReview = async (reviewId: Types.ObjectId) => {
    const deletedReview = await Review.findByIdAndDelete(reviewId);

    if (!deletedReview) {
        throw new CustomError("Review not found", 404);
    }

    await updateReviewState(new Types.ObjectId(deletedReview.productId));
}