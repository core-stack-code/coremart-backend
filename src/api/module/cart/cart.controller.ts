import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { addToCart, clearCart, deleteItemFromCart, getCart, removFromCart } from "./cart.service";
import { Types } from "mongoose";
import { AppResponse } from "../../../core/utils/response";

export const getCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const cart = await getCart(new Types.ObjectId(req.auth.userId));

        AppResponse(res, 200, {
           code: "OK",
            message: 'Cart fetched successfully.',
            data: {
                cart
            }
        });
    }
    catch (error) {
        next(error);
    }
}


export const addToCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId)
        const productId = new Types.ObjectId(req.body.productId as string)

        await addToCart(userId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product add to cart successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}


export const removFromCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId)
        const productId = new Types.ObjectId(req.body.productId as string)

        await removFromCart(userId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product remove from cart successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}


export const deleteItemFromCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId)
        const productId = new Types.ObjectId(req.body.productId as string)

        await deleteItemFromCart(userId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product deleted from cart successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}


export const clearCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId)

        await clearCart(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Cart clear successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}