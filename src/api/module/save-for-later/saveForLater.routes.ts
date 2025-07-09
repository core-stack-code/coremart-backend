import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middlewate";
import { getSaveForLaterListController, toggleSaveForLaterController } from "./saveForLater.controller";
import { toggleSaveForLaterSchema } from "./saveForLater.schema";

const router = express.Router();

router.post(
    '/',
    authMiddleware,
    validateRequest(toggleSaveForLaterSchema),
    toggleSaveForLaterController
)

router.get(
    '/',
    authMiddleware,
    getSaveForLaterListController
)

export default router;