import express from 'express';
import { brandController } from './brand.controller';
import { createBrandSchema, updateBrandSchema } from './brand.validator';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const brandRouter = express.Router();

brandRouter.post(
    '/',
    adminMiddleware,
    validationMiddleware.validateRequest(createBrandSchema),
    asyncWrapper(brandController.createBrand)
);

brandRouter.patch(
    '/:brandId',
    adminMiddleware,
    validationMiddleware.validateRequest(updateBrandSchema),
    asyncWrapper(brandController.updateBrand)
);

brandRouter.get(
    '/list',
    adminMiddleware,
    asyncWrapper(brandController.getBrandList)
);

brandRouter.post(
    '/:brandId/product/:productId',
    adminMiddleware,
    asyncWrapper(brandController.assignProduct)
);

brandRouter.delete(
    '/:brandId/product/:productId',
    adminMiddleware,
    asyncWrapper(brandController.removeProduct)
);

// public api (might need in future)
brandRouter.get(
    '/',
    asyncWrapper(brandController.getBrandSimpleList)
);

export default brandRouter;
