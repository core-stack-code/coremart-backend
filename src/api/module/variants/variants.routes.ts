import express from 'express';
import { 
    createProductSkuSchema,
    createProductVariantWithSkuSchema,
    updateProductSkuSchema,
    variantImageSchema
} from './variants.validator';
import { variantsController } from './variants.controller';

import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@api/utils/asyncWrapper';

const variantsRouter = express.Router();

variantsRouter.use(adminMiddleware)

variantsRouter.post(
    '/product/:productId',
    validationMiddleware.validateRequest(createProductVariantWithSkuSchema),
    asyncWrapper(variantsController.createVariants)
)

variantsRouter.patch(
    '/:variantId/image',
    validationMiddleware.validateRequest(variantImageSchema),
    asyncWrapper(variantsController.updateVariantImage)
)

variantsRouter.get(
    '/product/:productId',
    asyncWrapper(variantsController.getVariants)
)

variantsRouter.delete(
    '/:variantId',
    asyncWrapper(variantsController.deleteVariant)
)

variantsRouter.patch(
    '/sku/:skuId',
    validationMiddleware.validateRequest(updateProductSkuSchema),
    asyncWrapper(variantsController.updateProductSku)
)

// API is not implemented in the admin panel
variantsRouter.post(
    '/:variantId/sku',
    validationMiddleware.validateRequest(createProductSkuSchema),
    asyncWrapper(variantsController.createProductSku)
)

export default variantsRouter;