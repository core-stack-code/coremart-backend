import express from 'express'
import { productController } from './product.controller'
import { createProductSchema, createProductVariants, updateProductSchema } from './product.validator'
import { validationMiddleware } from '@api/middlewares/validate.middlewate'

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
    productController.getProductList
)

productRouter.get(
    '/:productId',
    productController.getProduct
)

productRouter.post(
    '/:productId/variants',
    validationMiddleware.validateRequest(createProductVariants),
    productController.createVariants
)

productRouter.get(
    '/:productId/variants',
    productController.getVariants
)

productRouter.delete(
    '/variants/:variantId',
    productController.deleteVariant
)

export default productRouter;