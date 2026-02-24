import express from "express";
import { discountController } from "./discount.controller";
import {
    createDiscountSchema,
    updateDiscountSchema,
    replaceScopeSchema,
    toggleDiscountSchema,
    discountListQuerySchema,
} from "./discount.validator";

import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const discountRouter = express.Router();

discountRouter.post(
    "/",
    adminMiddleware,
    validationMiddleware.validateRequest(createDiscountSchema),
    asyncWrapper(discountController.createDiscount)
);

discountRouter.put(
    "/:discountId",
    adminMiddleware,
    validationMiddleware.validateRequest(updateDiscountSchema),
    asyncWrapper(discountController.updateDiscount)
);

discountRouter.patch(
    "/:discountId/scope",
    adminMiddleware,
    validationMiddleware.validateRequest(replaceScopeSchema),
    asyncWrapper(discountController.replaceScope)
);

discountRouter.patch(
    "/:discountId/toggle",
    adminMiddleware,
    validationMiddleware.validateRequest(toggleDiscountSchema),
    asyncWrapper(discountController.toggleDiscount)
);

discountRouter.get(
    "/",
    adminMiddleware,
    validationMiddleware.validateQuery(discountListQuerySchema),
    asyncWrapper(discountController.getDiscountList)
);

discountRouter.get(
    "/:discountId",
    adminMiddleware,
    asyncWrapper(discountController.getDiscountById)
);

discountRouter.delete(
    "/:discountId",
    adminMiddleware,
    asyncWrapper(discountController.deleteDiscount)
);

export default discountRouter;