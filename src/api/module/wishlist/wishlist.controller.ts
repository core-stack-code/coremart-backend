import { Request, Response } from "express";
import { wishlistService } from "./wishlist.service";
import { ProductsOfWishlistQuery, WishlistPayload } from "./wishlist.validator";
import { AppResponse } from "@api/utils/response";


class WishlistController {
	public async createWishlist(req: Request, res: Response) {
		const userId = req.user!.id;
		const payload = req.body as WishlistPayload;

		await wishlistService.handleCreate(userId, payload);

		AppResponse(res, 201, {
			code: "CREATED",
			message: "Wishlist created successfully.",
		});
	}

	public async updateWishlist(req: Request, res: Response) {
        const userId = req.user!.id;
		const wishlistId = req.params.wishlistId;
		const payload = req.body as WishlistPayload;

		await wishlistService.handleUpdate(userId, wishlistId, payload);

		AppResponse(res, 200, {
			code: "OK",
			message: "Wishlist updated successfully.",
		});
	}

	public async deleteWishlist(req: Request, res: Response) {
        const userId = req.user!.id;
		const wishlistId = req.params.wishlistId;

		await wishlistService.handleDelete(userId, wishlistId);

		AppResponse(res, 200, {
			code: "OK",
			message: "Wishlist deleted successfully.",
		});
	}

    public async addProductToWishlist(req: Request, res: Response) {
        const userId = req.user!.id;
        const wishlistId = req.params.wishlistId;
        const productId = req.params.productId;

        await wishlistService.handleAddProduct(userId, wishlistId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product added to wishlist successfully.",
        });
    }

    public async removeProductFromWishlist(req: Request, res: Response) {
        const userId = req.user!.id;
        const wishlistId = req.params.wishlistId;
        const productId = req.params.productId;

        await wishlistService.handleRemoveProduct(userId, wishlistId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product removed from wishlist successfully.",
        });
    }

    public async getWishlists(req: Request, res: Response) {
        const userId = req.user!.id;

        const wishlists = await wishlistService.getWishlistsByUserId(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Wishlists fetched successfully.",
            data: wishlists,
        });
    }

    public async getAllWishlishProducts(req: Request, res: Response) {
        const userId = req.user!.id;
        const query = req.localsQuery as ProductsOfWishlistQuery;

        const products = await wishlistService.getAllWishlistProducts(userId, query);

        AppResponse(res, 200, {
            code: "OK",
            message: "Products of wishlists fetched successfully.",
            data: products,
        });
    }

    public async getProductsByWishlist(req: Request, res: Response) {
        const userId = req.user!.id;
        const wishlistId = req.params.wishlistId;
        const query = req.localsQuery as ProductsOfWishlistQuery;

        const products = await wishlistService.getProductsByWishlistId(userId, wishlistId, query);

        AppResponse(res, 200, {
            code: "OK",
            message: "Products of wishlist fetched successfully.",
            data: products,
        });
    }
}

export const wishlistController = new WishlistController();