import express from 'express';
import { brandController } from './brand.controller';
import { createBrandSchema, updateBrandSchema } from './brand.validator';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';

const brandRouter = express.Router();

brandRouter.post(
    '/',
    validationMiddleware.validateRequest(createBrandSchema),
    brandController.createBrand
);

brandRouter.patch(
    '/:brandId',
    validationMiddleware.validateRequest(updateBrandSchema),
    brandController.updateBrand
);

brandRouter.get(
    '/list',
    brandController.getBrandList
);



brandRouter.post(
    '/:brandId/product/:productId',
    brandController.assignProduct
);

brandRouter.delete(
    '/:brandId/product/:productId',
    brandController.removeProduct
);

// public api (might need in future)
brandRouter.get(
    '/',
    brandController.getBrandSimpleList
);

export default brandRouter;
