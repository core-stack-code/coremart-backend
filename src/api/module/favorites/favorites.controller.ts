import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { Types } from "mongoose";
import { toggleFavorite } from "./favorites.service";
import { successResponse } from "../../utils/response";

export const toggleFavoriteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const productId =  new Types.ObjectId(req.body.productId);
        const userId = new Types.ObjectId(req.auth.userId);

        await toggleFavorite(productId, userId);

        successResponse(res, {
            status: 200,
            message: 'Favorite updated successfully.',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
}