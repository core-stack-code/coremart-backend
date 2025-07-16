import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { addToCart, clearCart, deleteItemFromCart, getCart, removFromCart } from "./cart.service";
import { Types } from "mongoose";
import { successResponse } from "../../utils/response";

export const getCartController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const cart = await getCart(new Types.ObjectId(req.auth.userId));

        successResponse(res, {
            status: 200,
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

        successResponse(res, {
            status: 200,
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

        successResponse(res, {
            status: 200,
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

        successResponse(res, {
            status: 200,
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

        successResponse(res, {
            status: 200,
            message: 'Cart clear successfully.',
        });
    }
    catch (error) {
        next(error);
    }
}