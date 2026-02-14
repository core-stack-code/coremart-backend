import express from 'express';
import { 
    createProductSkuSchema,
    createProductVariantSchema,
    updateProductSkuSchema,
    variantImageSchema
} from './variants.validator';
import { variantsController } from './variants.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const variantsRouter = express.Router();

variantsRouter.post(
    '/product/:productId',
    adminMiddleware,
    validationMiddleware.validateRequest(createProductVariantSchema),
    asyncWrapper(variantsController.createVariants)
)

variantsRouter.patch(
    '/:variantId/image',
    adminMiddleware,
    validationMiddleware.validateRequest(variantImageSchema),
    asyncWrapper(variantsController.updateVariantImage)
)

variantsRouter.get(
    '/product/:productId',
    adminMiddleware,
    asyncWrapper(variantsController.getVariants)
)

variantsRouter.delete(
    '/:variantId',
    adminMiddleware,
    asyncWrapper(variantsController.deleteVariant)
)

variantsRouter.post(
    '/:variantId/sku',
    adminMiddleware,
    validationMiddleware.validateRequest(createProductSkuSchema),
    asyncWrapper(variantsController.createProductSku)
)

variantsRouter.patch(
    '/sku/:skuId',
    adminMiddleware,
    validationMiddleware.validateRequest(updateProductSkuSchema),
    asyncWrapper(variantsController.updateProductSku)
)

export default variantsRouter;