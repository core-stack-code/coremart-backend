import express from 'express'
import { productController } from './product.controller'
import { createProductSchema, productListQuerySchema, updateProductSchema } from './product.validator'
import { validationMiddleware } from '@api/middlewares/validate.middlewate'
import { createProductCategorySchema } from '@mod/product-category/productCategory.validator'
import { productCategoryController } from '@mod/product-category/productCategory.controller'
import { adminMiddleware } from '@api/middlewares/admin.middleware'
import { asyncWrapper } from '@core/utils/asyncWrapper'

const productRouter = express.Router()

productRouter.post(
    '/',
    adminMiddleware,
    validationMiddleware.validateRequest(createProductSchema),
    asyncWrapper(productController.createProduct)
)

productRouter.patch(
    '/:productId',
    adminMiddleware,
    validationMiddleware.validateRequest(updateProductSchema),
    asyncWrapper(productController.updateProduct)
)

productRouter.get(
    '/list',
    adminMiddleware,
    validationMiddleware.validateQuery(productListQuerySchema),
    asyncWrapper(productController.getProductList)
)

productRouter.get(
    '/:productId',
    adminMiddleware,
    asyncWrapper(productController.getProduct)
)

productRouter.post(
    '/:productId/category',
    adminMiddleware,
    validationMiddleware.validateRequest(createProductCategorySchema),
    asyncWrapper(productCategoryController.createProductCategory)
)

productRouter.delete(
    "/:productId/category/:categoryId",
    adminMiddleware,
    asyncWrapper(productCategoryController.deleteProductCategory)
)

export default productRouter;