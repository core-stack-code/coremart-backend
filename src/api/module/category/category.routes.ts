import express from "express";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { createCategorySchema, updateCategorySchema } from "./category.validator";
import { categoryController } from "./category.controller";
import { productCategoryController } from "@mod/product-category/productCategory.controller";

const categoryRouter = express.Router();

categoryRouter.post(
    "/",
    validationMiddleware.validateRequest(createCategorySchema),
    categoryController.createCategory
);

categoryRouter.patch(
    "/:id",
    validationMiddleware.validateRequest(updateCategorySchema),
    categoryController.updateCategory
);

categoryRouter.get(
    "/",
    categoryController.getCategoryTree
);

categoryRouter.get(
    "/list",
    categoryController.getCategoryList
);

categoryRouter.patch(
    "/:categoryId/toggle",
    categoryController.toggleActive
);

categoryRouter.get(
    '/:categoryId/products',
    productCategoryController.getProductByCategory
)

export default categoryRouter;