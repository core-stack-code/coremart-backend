import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";


class ReviewRepository {
    public create = async (data: {
        userId: string;
        productId: string;
        rating: number;
        comment?: string;
    }, tx: PrismaTx = prisma) => {
        return await tx.review.create({
            data: {
                id: getUuid(),
                userId: data.userId,
                productId: data.productId,
                rating: data.rating,
                comment: data.comment || null,
            },
        });
    };

    public update = async (userId: string, reviewId: string, data: {
        rating?: number;
        comment?: string | null;
    }, tx: PrismaTx = prisma) => {
        return await tx.review.update({
            where: { id: reviewId, userId },
            data: {
                rating: data.rating,
                comment: data.comment,
            },
        });
    };

    public delete = async (userId: string, reviewId: string, tx: PrismaTx = prisma) => {
        return await tx.review.delete({
            where: { id: reviewId, userId },
        });
    };

    public findByUserAndProduct = async (userId: string, productId: string) => {
        return await prisma.review.findUnique({
            where: { userId_productId: { userId, productId } },
        });
    };

    public getRating = async (productId: string, tx: PrismaTx = prisma) => {
        return await tx.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true }
        });
    }
}

export const reviewRepository = new ReviewRepository();