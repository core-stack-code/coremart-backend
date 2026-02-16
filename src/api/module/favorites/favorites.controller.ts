import { Request, Response } from "express";
import { favoritesService } from "./favorites.service";
import { FavoriteListQuery } from "./favorites.validator";
import { AppResponse } from "@core/utils/response";

class FavoritesController {
    public async getFavoritesList(req: Request, res: Response) {
        const userId = req.user!.id;
        const query = req.localsQuery as FavoriteListQuery;

        const result = await favoritesService.getFavoritesList(userId, query);

        AppResponse(res, 200, {
            code: "OK",
            message: "Favorites fetched successfully",
            data: result,
        });
    }

    public async addFavorite(req: Request, res: Response) {
        const userId = req.user!.id;
        const { productId } = req.params;

        await favoritesService.addFavorite(userId, productId);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product added to favorites successfully",
        });
    }

    public async removeFavorite(req: Request, res: Response) {
        const userId = req.user!.id;
        const { productId } = req.params;

        await favoritesService.removeFavorite(userId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product removed from favorites successfully",
        });
    }
}

export const favoritesController = new FavoritesController();