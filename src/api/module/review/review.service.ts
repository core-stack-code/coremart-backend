import { prisma, PrismaTx } from "@core/config/prisma";
import { reviewRepository } from "./review.repository";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.validator";

import { productRepository } from "@mod/product/product.repository";
import { orderRepository } from "@mod/order/order.repository";
import { AppError } from "@core/utils/response";


class ReviewService {
    public async handleCreate(userId: string, payload: CreateReviewPayload) {
        await prisma.$transaction(async (tx) => {
            const product = await orderRepository.findProductFromUserOrders(userId, payload.productId, tx);
    
            if (!product) {
                throw new AppError(
                    400,
                    "BAD_REQUEST",
                    "You can only review products you have purchased and received."
                );
            }
    
            await reviewRepository.create({
                userId,
                productId: payload.productId,
                rating: payload.rating,
                comment: payload.comment,
            }, tx);
    
            await this.updateProductRating(payload.productId, tx);
        });
    }

    public async handleUpdate(userId: string, reviewId: string, payload: UpdateReviewPayload) {
        await prisma.$transaction(async (tx) => {
            const review = await reviewRepository.update(userId, reviewId, {
                rating: payload.rating,
                comment: payload.comment,
            }, tx);
    
            await this.updateProductRating(review.productId, tx);
        });
    }

    public async handleDelete(userId: string, reviewId: string) {
        await prisma.$transaction(async (tx) => {
            const review = await reviewRepository.delete(userId, reviewId, tx);
            await this.updateProductRating(review.productId, tx);
        });
    }

    private async updateProductRating(productId: string, tx: PrismaTx) {
        const result = await reviewRepository.getRating(productId, tx);

        await productRepository.update(productId, {
            rating: result._avg.rating || 0,
            totalReviews: result._count.rating,
        }, tx);
    }
}

export const reviewService = new ReviewService();