import express from 'express';
import { brandController } from './brand.controller';
import { createBrandSchema, updateBrandSchema } from './brand.validator';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@api/utils/asyncWrapper';

const brandRouter = express.Router();

brandRouter.use(adminMiddleware());

brandRouter.post(
    '/',
    validationMiddleware.validateRequest(createBrandSchema),
    asyncWrapper(brandController.createBrand)
);

brandRouter.patch(
    '/:brandId',
    validationMiddleware.validateRequest(updateBrandSchema),
    asyncWrapper(brandController.updateBrand)
);

brandRouter.get(
    '/list',
    asyncWrapper(brandController.getBrandList)
);

brandRouter.post(
    '/:brandId/product/:productId',
    asyncWrapper(brandController.assignProduct)
);

brandRouter.delete(
    '/:brandId/product/:productId',
    asyncWrapper(brandController.removeProduct)
);

export default brandRouter;
