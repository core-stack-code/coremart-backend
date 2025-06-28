import express from 'express'
import { validateQuery } from '../../middlewares/validate.middlewate'
import { getProfuctListController } from './products.controller'
import { productListQuerySchema } from './products.schemas'

const router = express.Router()

router.get(
    '/',
    validateQuery(productListQuerySchema),
    getProfuctListController
)

export default router