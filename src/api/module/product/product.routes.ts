import express from 'express'
import { productController } from './product.controller'
import { createProductSchema, productListQuerySchema, updateProductSchema } from './product.validator'

import { validationMiddleware } from '@api/middlewares/validate.middlewate'
import { adminMiddleware } from '@api/middlewares/admin.middleware'
import { asyncWrapper } from '@api/utils/asyncWrapper'

const productRouter = express.Router()

productRouter.use(adminMiddleware)

productRouter.post(
    '/',
    validationMiddleware.validateRequest(createProductSchema),
    asyncWrapper(productController.createProduct)
)

productRouter.patch(
    '/:productId',
    validationMiddleware.validateRequest(updateProductSchema),
    asyncWrapper(productController.updateProduct)
)

productRouter.get(
    '/list',
    validationMiddleware.validateQuery(productListQuerySchema),
    asyncWrapper(productController.getProductList)
)

productRouter.get(
    '/options',
    asyncWrapper(productController.getProductOptions)
)

productRouter.get(
    '/:productId',
    asyncWrapper(productController.getProduct)
)

export default productRouter;