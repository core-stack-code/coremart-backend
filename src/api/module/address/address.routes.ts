import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { addAddressController } from "./address.controller";
import { addressSchema } from "./address.schema";
import { validateRequest } from "../../middlewares/validate.middlewate";

const router = Router();

router.post("/", validateRequest(addressSchema), authMiddleware, addAddressController)

export default router;