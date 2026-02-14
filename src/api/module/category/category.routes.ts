import express from "express";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { createCategorySchema, updateCategorySchema } from "./category.validator";
import { categoryController } from "./category.controller";
import { productCategoryController } from "@mod/product-category/productCategory.controller";
import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const categoryRouter = express.Router();

categoryRouter.post(
    "/",
    adminMiddleware,
    validationMiddleware.validateRequest(createCategorySchema),
    asyncWrapper(categoryController.createCategory)
);

categoryRouter.patch(
    "/:id",
    adminMiddleware,
    validationMiddleware.validateRequest(updateCategorySchema),
    asyncWrapper(categoryController.updateCategory)
);

categoryRouter.get(
    "/",
    adminMiddleware,
    asyncWrapper(categoryController.getCategoryTree)
);

categoryRouter.get(
    "/list",
    adminMiddleware,
    asyncWrapper(categoryController.getCategoryList)
);

categoryRouter.patch(
    "/:categoryId/toggle",
    adminMiddleware,
    asyncWrapper(categoryController.toggleActive)
);

categoryRouter.get(
    '/:categoryId/products',
    adminMiddleware,
    asyncWrapper(productCategoryController.getProductByCategory)
);

export default categoryRouter;