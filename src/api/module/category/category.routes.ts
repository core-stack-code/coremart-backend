import express from "express";
import { categoryListQuery, createCategorySchema, updateCategorySchema } from "./category.validator";
import { categoryController } from "./category.controller";

import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { productCategoryController } from "@mod/product-category/productCategory.controller";
import { adminMiddleware } from "@api/middlewares/admin.middleware";
import { asyncWrapper } from "@api/utils/asyncWrapper";

const categoryRouter = express.Router();

categoryRouter.use(adminMiddleware());

categoryRouter.post(
    "/",
    validationMiddleware.validateRequest(createCategorySchema),
    asyncWrapper(categoryController.createCategory)
);

categoryRouter.patch(
    "/:id",
    validationMiddleware.validateRequest(updateCategorySchema),
    asyncWrapper(categoryController.updateCategory)
);

categoryRouter.get(
    "/list",
    validationMiddleware.validateQuery(categoryListQuery),
    asyncWrapper(categoryController.getCategoryList)
);

categoryRouter.get(
    "/options",
    asyncWrapper(categoryController.getCategoriesOptions)
);

categoryRouter.get(
    "/:categoryId/tree",
    asyncWrapper(categoryController.getCategoryTree)
);

categoryRouter.get(
    '/:categoryId/products',
    asyncWrapper(productCategoryController.getProductByCategory)
);

categoryRouter.post(
    '/:categoryId/product/:productId',
    asyncWrapper(productCategoryController.createProductCategory)
)

categoryRouter.delete(
    "/:categoryId/product/:productId",
    asyncWrapper(productCategoryController.deleteProductCategory)
)

export default categoryRouter;