
import { prisma } from "@core/config/prisma";
import { Prisma } from "generated/prisma/client";
import { getUuid } from "@core/utils/db.helper";


class WishlistRepository {
	public create = async (data: {
		userId: string;
		name: string;
	}) => {
		return await prisma.wishList.create({
			data: {
				id: getUuid(),
				userId: data.userId,
				name: data.name,
			},
		});
	}

    public count = async (userId: string) => {
        return await prisma.wishList.count({
            where: { userId },
        });
    }

	public update = async (userId: string, wishlistId: string, name: string) => {
		return await prisma.wishList.update({
			where: { id: wishlistId, userId },
			data: { name },
		});
	}

	public delete = async (userId: string, wishlistId: string) => {
		return await prisma.wishList.delete({
			where: { id: wishlistId, userId },
		});
	}

    public findById = async (id: string) => {
        return await prisma.wishList.findUnique({
            where: { id },
        });
    }

    public createWishlistProduct = async (data: {
        wishListId: string;
        productId: string;
    }) => {
        await prisma.wishListItem.create({
            data: {
                wishListId: data.wishListId,
                productId: data.productId,
            },
        });
    }

    public removeWishlistProduct = async (wishListId: string, productId: string) => {
        await prisma.wishListItem.delete({
            where: {
                wishListId_productId: {
                    wishListId,
                    productId,
                }
            },
        });
    }

    public findWishLists = async (userId: string) => {
        return await prisma.wishList.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
            },
        });
    }

    public findProductsOfWishlist = async (where: Prisma.WishListItemWhereInput, skip: number, take: number) => {
        return await prisma.wishListItem.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        description: true,
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

    public countProductsOfWishlist = async (where: Prisma.WishListItemWhereInput) => {
        return await prisma.wishListItem.count({
            where,
        });
    }
}

export const wishlistRepository = new WishlistRepository();