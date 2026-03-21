import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import express from "express";
import { customersListSchema } from "./customer.validator";
import { customerController } from "./customer.controller";

const customerRouter = express.Router();

customerRouter.use(adminMiddleware());

customerRouter.get(
    "/",
    validationMiddleware.validateQuery(customersListSchema),
    customerController.getCustomers
)

customerRouter.get(
    "/:customerId",
    customerController.getCustomerDetail
)

export default customerRouter;