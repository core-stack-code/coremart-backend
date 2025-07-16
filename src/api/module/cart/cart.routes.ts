import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addToCartController, clearCartController, deleteItemFromCartController, getCartController, removFromCartController } from "./cart.controller";
import { commonCartPoductSchema } from "./cart.schema";
import { validateRequest } from "../../middlewares/validate.middlewate";

const router = express.Router()

router.get(
    '/',
    authMiddleware,
    getCartController
)

router.post(
    '/items',
    authMiddleware,
    validateRequest(commonCartPoductSchema),
    addToCartController
)

router.patch(
    '/items',
    authMiddleware,
    validateRequest(commonCartPoductSchema),
    removFromCartController
)

router.delete(
    '/items',
    authMiddleware,
    validateRequest(commonCartPoductSchema),
    deleteItemFromCartController
)

router.delete(
    '/',
    authMiddleware,
    clearCartController
)

export default router;