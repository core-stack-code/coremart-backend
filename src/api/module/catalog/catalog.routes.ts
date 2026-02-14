import express from "express";
import { catalogController } from "./catalog.controller";
import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { productListQuerySchema, productsByCategoryQuerySchema } from "./catalog.validator";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const catalogRouter = express.Router();

catalogRouter.get(
    "/product/:productSlug",
    asyncWrapper(catalogController.getProductDetail)
)

catalogRouter.get(
    "/products",
    validationMiddleware.validateQuery(productListQuerySchema),
    asyncWrapper(catalogController.getProducts)
)

catalogRouter.get(
    "/categories",
    asyncWrapper(catalogController.getRootCategories)
)

catalogRouter.get(
    "/category/:categorySlug/tree",
    asyncWrapper(catalogController.getSubCategories)
)

catalogRouter.get(
    "/category/:categorySlug/products",
    validationMiddleware.validateQuery(productsByCategoryQuerySchema),
    asyncWrapper(catalogController.getProductsByCategory)
)

export default catalogRouter;