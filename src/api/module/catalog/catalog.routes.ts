import express from "express";
import { catalogController } from "./catalog.controller";
import { productListQuerySchema, productsByCategoryQuerySchema } from "./catalog.validator";

import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { authMiddleware } from "@api/middlewares/auth.middleware";
import { asyncWrapper } from "@core/utils/asyncWrapper";

const catalogRouter = express.Router();

catalogRouter.get(
    "/product/:productSlug",
    authMiddleware({ isGuestRoute: true }),
    asyncWrapper(catalogController.getProductDetail)
)

catalogRouter.get(
    "/products",
    authMiddleware({ isGuestRoute: true }),
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
    authMiddleware({ isGuestRoute: true }),
    validationMiddleware.validateQuery(productsByCategoryQuerySchema),
    asyncWrapper(catalogController.getProductsByCategory)
)

export default catalogRouter;