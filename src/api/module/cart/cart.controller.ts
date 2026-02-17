import { Request, Response } from "express";
import { cartService } from "./cart.service";
import { UpdateCartItemPayload } from "./cart.validator";
import { AppResponse } from "@core/utils/response";


class CartController {
    public async addToCart(req: Request, res: Response) {
        const userId = req.user!.id;
        const skuId = req.params.skuId;

        await cartService.addToCart(userId, skuId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product added to cart successfully",
        })
    }

    public async getCart(req: Request, res: Response) {
        const userId = req.user!.id;

        const cart = await cartService.getCartData(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Cart retrieved successfully",
            data: cart,
        })
    }

    public async removeFromCart(req: Request, res: Response) {
        const userId = req.user!.id;
        const skuId = req.params.skuId;

        await cartService.removeFromCart(userId, skuId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product removed from cart successfully",
        })
    }

    public async updateCart(req: Request, res: Response) {
        const userId = req.user!.id;
        const skuId = req.params.skuId;
        const payload = req.body as UpdateCartItemPayload;

        await cartService.updateCartItems(userId, skuId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Cart updated successfully",
        })
    }

    public async clearCart(req: Request, res: Response) {
        const userId = req.user!.id;

        await cartService.clearCart(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Cart cleared successfully",
        })
    }
}

export const cartController = new CartController();