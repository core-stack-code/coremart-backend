import express from "express"
import { orderManagmentController } from "./orderManagment.controller"
import { orderListQuerySchema, orderStatusSchema, paymentStatusSchema } from "./orderManagment.validator"

import { adminMiddleware } from "@api/middlewares/admin.middleware"
import { validationMiddleware } from "@api/middlewares/validate.middlewate"
import { asyncWrapper } from "@core/utils/asyncWrapper"

const orderManagmentRouter = express.Router()

orderManagmentRouter.get(
    "/",
    adminMiddleware,
    validationMiddleware.validateQuery(orderListQuerySchema),
    asyncWrapper(orderManagmentController.orderList)
)

orderManagmentRouter.get(
    "/:orderId",
    adminMiddleware,
    asyncWrapper(orderManagmentController.orderDetails)
)

orderManagmentRouter.patch(
    '/:orderId/status',
    adminMiddleware,
    validationMiddleware.validateRequest(orderStatusSchema),
    asyncWrapper(orderManagmentController.changeOrderStatus)
)

orderManagmentRouter.patch(
    '/:orderId/payment/:paymentId',
    adminMiddleware,
    validationMiddleware.validateRequest(paymentStatusSchema),
    asyncWrapper(orderManagmentController.changePaymentStatus)
)

export default orderManagmentRouter;