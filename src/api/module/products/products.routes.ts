import express from 'express'
import { validateQuery } from '../../middlewares/validate.middlewate'
import { 
    getBestSellerProductsController, getNewArrivalProductsController,
    getProductController, getProfuctListController,
    getRecentlyViewProductsController,
    getTrandingProductsController 
} from './products.controller'
import { productListQuerySchema } from './products.schemas'
import { publicGuestMiddleware } from '../../middlewares/publicGuest.middleware'
import { authMiddleware } from '../../middlewares/auth.middleware'

const router = express.Router()

router.get(
    '/',
    publicGuestMiddleware,
    validateQuery(productListQuerySchema),
    getProfuctListController
)

router.get(
    '/new-arrivals',
    publicGuestMiddleware,
    getNewArrivalProductsController
)

router.get(
    '/best-sellers',
    publicGuestMiddleware,
    getBestSellerProductsController
)

router.get(
    '/tranding',
    publicGuestMiddleware,
    getTrandingProductsController
)

router.get(
    '/recently-view',
    authMiddleware,
    getRecentlyViewProductsController
)

router.get(
    '/:slug',
    publicGuestMiddleware,
    getProductController
)

export default router