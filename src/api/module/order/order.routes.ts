import express from "express";
import { orderController } from "./order.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const orderRouter = express.Router();

orderRouter.post(
    "/order/checkout",
    authMiddleware(),
    asyncWrapper(orderController.checkout)
)

orderRouter.post(
    "/cashfree/webhook",
    asyncWrapper(orderController.paymentWebhook)
)

export default orderRouter;