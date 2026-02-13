import express from 'express'
import { productController } from './product.controller'
import { createProductSchema, productListQuerySchema, updateProductSchema } from './product.validator'
import { validationMiddleware } from '@api/middlewares/validate.middlewate'
import { createProductCategorySchema } from '@mod/product-category/productCategory.validator'
import { productCategoryController } from '@mod/product-category/productCategory.controller'

const productRouter = express.Router()

productRouter.post(
    '/',
    validationMiddleware.validateRequest(createProductSchema),
    productController.createProduct
)

productRouter.patch(
    '/:productId',
    validationMiddleware.validateRequest(updateProductSchema),
    productController.updateProduct
)

productRouter.get(
    '/list',
    validationMiddleware.validateQuery(productListQuerySchema),
    productController.getProductList
)

productRouter.get(
    '/:productId',
    productController.getProduct
)

productRouter.post(
    '/:productId/category',
    validationMiddleware.validateRequest(createProductCategorySchema),
    productCategoryController.createProductCategory
)

productRouter.delete(
    "/:productId/category/:categoryId",
    productCategoryController.deleteProductCategory
)

export default productRouter;