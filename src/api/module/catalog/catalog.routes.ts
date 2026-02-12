import express from "express";
import { catalogController } from "./catalog.controller";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { productListQuerySchema, productsByCategoryQuerySchema } from "./catalog.validator";

const catalogRouter = express.Router();

catalogRouter.get(
    "/product/:productSlug",
    catalogController.getProductDetail
)

catalogRouter.get(
    "/products",
    validationMiddleware.validateQuery(productListQuerySchema),
    catalogController.getProducts
)

catalogRouter.get(
    "/categories",
    catalogController.getRootCategories
)

catalogRouter.get(
    "/category/:categorySlug/tree",
    catalogController.getSubCategories
)

catalogRouter.get(
    "/category/:categorySlug/products",
    validationMiddleware.validateQuery(productsByCategoryQuerySchema),
    catalogController.getProductsByCategory
)

export default catalogRouter;