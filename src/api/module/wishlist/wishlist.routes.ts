import express from "express";
import { productsOfWishlistQuerySchema, wishlistSchema } from "./wishlist.validator";
import { wishlistController } from "./wishlist.controller";

import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { authMiddleware } from "@api/middlewares/auth.middleware";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const wishlistRouter = express.Router();

wishlistRouter.use(authMiddleware());

wishlistRouter.post(
	"/",
	validationMiddleware.validateRequest(wishlistSchema),
	asyncWrapper(wishlistController.createWishlist)
);

wishlistRouter.patch(
	"/:wishlistId",
	validationMiddleware.validateRequest(wishlistSchema),
	asyncWrapper(wishlistController.updateWishlist)
);

wishlistRouter.delete(
	"/:wishlistId",
	asyncWrapper(wishlistController.deleteWishlist)
);

wishlistRouter.post(
    "/:wishlistId/product/:productId",
    asyncWrapper(wishlistController.addProductToWishlist)
)

wishlistRouter.delete(
    "/:wishlistId/product/:productId",
    asyncWrapper(wishlistController.removeProductFromWishlist)
)

wishlistRouter.get(
    "/",
    asyncWrapper(wishlistController.getWishlists)
);

wishlistRouter.get(
    "/product",
    validationMiddleware.validateQuery(productsOfWishlistQuerySchema),
    asyncWrapper(wishlistController.getAllWishlishProducts)
);

wishlistRouter.get(
    "/product/:wishlistId",
    validationMiddleware.validateQuery(productsOfWishlistQuerySchema),
    asyncWrapper(wishlistController.getProductsByWishlist)
);

export default wishlistRouter;