import express from "express";
import { orderController } from "./order.controller";
import { checkoutSchema, orderListQuerySchema } from "./order.validator";

import { authMiddleware } from "@api/middlewares/auth.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { asyncWrapper } from "@api/utils/asyncWrapper";

const orderRouter = express.Router();

// user routes
orderRouter.post(
    "/checkout",
    authMiddleware(),
    validationMiddleware.validateRequest(checkoutSchema),
    asyncWrapper(orderController.checkout)
)

orderRouter.get(
    "/",
    authMiddleware(),
    validationMiddleware.validateQuery(orderListQuerySchema),
    asyncWrapper(orderController.getOrders)
)

orderRouter.get(
    "/:orderId",
    authMiddleware(),
    asyncWrapper(orderController.getOrderDetails)
)

orderRouter.post(
    "/:orderId/retry-payment",
    authMiddleware(),
    asyncWrapper(orderController.retryPayment)
)

// webhook routes
orderRouter.post(
    "/cashfree/webhook",
    asyncWrapper(orderController.paymentWebhook)
)


export default orderRouter;