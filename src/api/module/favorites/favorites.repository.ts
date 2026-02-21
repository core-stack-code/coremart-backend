import { prisma, PrismaTx } from "@core/config/prisma";


class FavoritesRepository {
    public findFavoriteProducts = async (userId: string, skip: number, take: number) => {
        return await prisma.favoriteProduct.findMany({
            where: {
                userId,
                product: {
                    status: "ACTIVE",
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
                        rating: true,
                        totalReviews: true,
                        brand: {
                            select: {
                                name: true,
                                slug: true,
                            },
                        },
                        variants: {
                            select: {
                                imageUrl: true,
                                sku: { select: { price: true } },
                            },
                        },
                        productImages: {
                            where: { type: "THUMBNAIL" },
                            select: {
                                url: true,
                                altText: true,
                            },
                            take: 1,
                        },
                    },
                },
            },
        });
    }

    public countFavoriteProducts = async (userId: string, tx: PrismaTx = prisma) => {
        return await tx.favoriteProduct.count({ 
            where: {
                userId,
                product: {
                    status: "ACTIVE",
                },
            }
         });
    }

    public addFavorite = async (data: {
        userId: string;
        productId: string;
    }) => {
        return await prisma.favoriteProduct.create({
            data: {
                userId: data.userId,
                productId: data.productId,
            },
        });
    }

    public removeFavorite = async (userId: string, productId: string) => {
        return await prisma.favoriteProduct.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                }
            },
        });
    }

    public checkFavorite = async (userId: string, productId: string) => {
        return await prisma.favoriteProduct.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId
                }
            }
        });
    }

    public findByUserAndProductIds = async (userId: string, productIds: string[]) => {
        return await prisma.favoriteProduct.findMany({
            where: {
                userId,
                productId: { in: productIds },
            },
            select: { productId: true },
        });
    }
}

export const favoritesRepository = new FavoritesRepository();