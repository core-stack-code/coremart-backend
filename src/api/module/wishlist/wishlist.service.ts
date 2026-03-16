import { Prisma } from "generated/prisma/client";
import { ProductsOfWishlistQuery, WishlistPayload } from "./wishlist.validator";
import { wishlistRepository } from "./wishlist.repository";

import { catalogService } from "@mod/catalog/catalog.service";
import { formatProductListItem } from "@core/utils/product.helper";
import { ProductListApiResponse } from "@core/types/product";
import { AppError } from "@api/utils/response";

const MAX_WISHLIST_PER_USER = 3;


class WishlistService {
	public async handleCreate(userId: string, payload: WishlistPayload) {
        const count = await wishlistRepository.count(userId);

        if (count >= MAX_WISHLIST_PER_USER) {
            throw new AppError(
                409,
                "CONFLICT",
                `You can only have up to ${MAX_WISHLIST_PER_USER} wishlists.`
            );
        }

		await wishlistRepository.create({
			userId,
			name: payload.name,
		});
	}

	public async handleUpdate(userId: string, wishlistId: string, payload: WishlistPayload) {
		await wishlistRepository.update(userId, wishlistId, payload.name);
	}

	public async handleDelete(userId: string, wishlistId: string) {
		await wishlistRepository.delete(userId, wishlistId);
	}

    public async handleAddProduct(userId: string, wishListId: string, productId: string) {
        await this.checkWishlistOwnership(userId, wishListId);

        await catalogService.checkActiveProduct(productId);

        await wishlistRepository.createWishlistProduct({
            wishListId,
            productId,
        });        
    }

    public async handleRemoveProduct(userId: string, wishListId: string, productId: string) {
        await this.checkWishlistOwnership(userId, wishListId);

        await catalogService.checkActiveProduct(productId);

        await wishlistRepository.removeWishlistProduct(wishListId, productId);
    }

    public async getWishlistsByUserId(userId: string) {
        return await wishlistRepository.findWishLists(userId);
    }

    public async getAllWishlistProducts(
        userId: string, query: ProductsOfWishlistQuery
    ): Promise<ProductListApiResponse> {
        return await this.productsOfWishlist(userId, query, "ALL");
    }

    public async getProductsByWishlistId(
        userId: string, wishListId: string, query: ProductsOfWishlistQuery
    ): Promise<ProductListApiResponse> {
        await this.checkWishlistOwnership(userId, wishListId);

        return await this.productsOfWishlist(wishListId, query, "BY_WISHLIST");
    }

    private async checkWishlistOwnership(userId: string, wishListId: string) {
        const wishlist = await wishlistRepository.findById(wishListId);

        if (!wishlist) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Wishlist not found.");
        }

        if (wishlist.userId !== userId) {
            throw new AppError(409, "CONFLICT", "Not able to modify products in a wishlist.");
        }

        return wishlist;
    }

    private async productsOfWishlist(id: string, query: ProductsOfWishlistQuery, type : "ALL" | "BY_WISHLIST") {
        const where: Prisma.WishListItemWhereInput = type === "ALL" ? {
            wishList: {
                userId: id,
            },
        } : {
            wishListId: id,
        };

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const productList = await wishlistRepository.findProductsOfWishlist(where, skip, take);
        const total = await wishlistRepository.countProductsOfWishlist(where);

        const products = productList.map((item) => item.product);

        const formattedProducts = formatProductListItem(products, false, false);
        const totalPages = Math.ceil(total / query.limit);

        return {
            products: formattedProducts,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalPages,
                totalItems: total,
                isPrevPage: query.page > 1,
                isNextPage: query.page < totalPages,
            },
        };
    }
}

export const wishlistService = new WishlistService();