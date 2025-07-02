import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middlewate";
import { toggleFavoriteSchema } from "./favorites.schema";
import { toggleFavoriteController } from "./favorites.controller";

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateRequest(toggleFavoriteSchema),
    toggleFavoriteController
)

export default router;