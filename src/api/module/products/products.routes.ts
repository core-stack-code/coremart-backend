import express from 'express'
import { validateQuery } from '../../middlewares/validate.middlewate'
import { getProductController, getProfuctListController } from './products.controller'
import { productListQuerySchema } from './products.schemas'
import { publicGuestMiddleware } from '../../middlewares/publicGuest.middleware'

const router = express.Router()

router.get(
    '/',
    publicGuestMiddleware,
    validateQuery(productListQuerySchema),
    getProfuctListController
)

router.get(
    '/:slug',
    publicGuestMiddleware,
    getProductController
)

export default router