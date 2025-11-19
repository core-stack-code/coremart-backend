import express from "express";
import { checkoutController } from "./checkout.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validate.middlewate";
import { checkoutSchema } from "./checkout.schema";

const router = express.Router();

router.post('/', validateRequest(checkoutSchema), authMiddleware, checkoutController);

export default router