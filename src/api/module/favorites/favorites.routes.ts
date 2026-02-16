import express from "express";
import { favoriteListQuerySchema } from "./favorites.validator";
import { favoritesController } from "./favorites.controller";

import { authMiddleware } from "@api/middlewares/auth.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const favoritesRouter = express.Router();

favoritesRouter.use(authMiddleware());

favoritesRouter.get(
    "/",
    validationMiddleware.validateQuery(favoriteListQuerySchema),
    asyncWrapper(favoritesController.getFavoritesList)
);

favoritesRouter.post(
    "/:productId",
    asyncWrapper(favoritesController.addFavorite)
);

favoritesRouter.delete(
    "/:productId",
    asyncWrapper(favoritesController.removeFavorite)
);

export default favoritesRouter;