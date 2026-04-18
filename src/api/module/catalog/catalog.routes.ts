import express from "express";
import { catalogController } from "./catalog.controller";
import { productListQuerySchema, productsByCategoryQuerySchema } from "./catalog.validator";

import { validationMiddleware } from "@api/middlewares/validate.middlewate";
import { authMiddleware } from "@api/middlewares/auth.middleware";
import { asyncWrapper } from "@api/utils/asyncWrapper";
import { attributesController } from "@mod/attributes/attributes.controller";

const catalogRouter = express.Router();

catalogRouter.use(authMiddleware({ isGuestRoute: true }));

catalogRouter.get(
    '/product/new-arrivals',
    asyncWrapper(catalogController.getNewArrivals)
)

catalogRouter.get(
    '/product/top-rated',
    asyncWrapper(catalogController.getTopRatedProducts)
)

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

catalogRouter.get(
    "/reviews/product/:productSlug",
    asyncWrapper(catalogController.getProductReviews)
)

catalogRouter.get(
    "/brand",
    asyncWrapper(catalogController.getBrandList)
)

catalogRouter.get(
    '/attributes',
    asyncWrapper(attributesController.getAttibutes)
)


export default catalogRouter;
