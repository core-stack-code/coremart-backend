import express from "express";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { createAddressSchema, updateAddressSchema } from "./address.validator";
import { addressController } from "./address.controller";
import { authMiddleware } from "@api/middlewares/auth.middleware";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const addressRouter = express.Router();

addressRouter.use(authMiddleware());

addressRouter.post(
    "/",
    validationMiddleware.validateRequest(createAddressSchema),
    asyncWrapper(addressController.createAddress)
);

addressRouter.patch(
    "/:addressId",
    validationMiddleware.validateRequest(updateAddressSchema),
    asyncWrapper(addressController.updateAddress)
);

addressRouter.delete(
    "/:addressId",
    asyncWrapper(addressController.deleteAddress)
);

addressRouter.get(
    "/",
    asyncWrapper(addressController.getAddressList)
);

export default addressRouter;
