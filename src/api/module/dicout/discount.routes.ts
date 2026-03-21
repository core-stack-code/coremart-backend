import express from "express";
import { discountController } from "./discount.controller";
import {
    createDiscountSchema,
    updateDiscountSchema,
    replaceScopeSchema,
    discountListQuerySchema,
} from "./discount.validator";

import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { asyncWrapper } from "@api/utils/asyncWrapper";

const discountRouter = express.Router();

discountRouter.use(adminMiddleware());

discountRouter.post(
    "/",
    validationMiddleware.validateRequest(createDiscountSchema),
    asyncWrapper(discountController.createDiscount)
);

discountRouter.put(
    "/:discountId",
    validationMiddleware.validateRequest(updateDiscountSchema),
    asyncWrapper(discountController.updateDiscount)
);

discountRouter.patch(
    "/:discountId/scope",
    validationMiddleware.validateRequest(replaceScopeSchema),
    asyncWrapper(discountController.replaceScope)
);

discountRouter.get(
    "/",
    validationMiddleware.validateQuery(discountListQuerySchema),
    asyncWrapper(discountController.getDiscountList)
);

discountRouter.get(
    "/:discountId",
    asyncWrapper(discountController.getDiscountById)
);

discountRouter.delete(
    "/:discountId",
    asyncWrapper(discountController.deleteDiscount)
);

export default discountRouter;