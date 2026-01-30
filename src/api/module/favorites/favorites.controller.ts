import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { Types } from "mongoose";
import { getFavoritesList, toggleFavorite } from "./favorites.service";
import { AppResponse } from "../../../core/utils/response";

export const toggleFavoriteController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const productId =  new Types.ObjectId(req.body.productId);
        const userId = new Types.ObjectId(req.auth.userId);

        await toggleFavorite(productId, userId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Favorite updated successfully.',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
}

export const getFavoritesListController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId);
        const favorites = await getFavoritesList(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Favorites list fetched successfully.',
            data: {
                favorites
            }
        });
    } catch (error) {
        next(error);
    }
}