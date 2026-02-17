import express from "express";
import { cartController } from "./cart.controller";
import { updateCartItemSchema } from "./cart.validator";

import { authMiddleware } from "@api/middlewares/auth.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";

const cartRouter = express.Router();

cartRouter.use(authMiddleware());

cartRouter.post(
    '/:skuId',
    cartController.addToCart
)

cartRouter.get(
    '/',
    cartController.getCart
)

cartRouter.patch(
    "/:skuId",
    validationMiddleware.validateRequest(updateCartItemSchema),
    cartController.updateCart
)

cartRouter.delete(
    "/",
    cartController.clearCart
)

cartRouter.delete(
    '/:skuId',
    cartController.removeFromCart
)

export default cartRouter;