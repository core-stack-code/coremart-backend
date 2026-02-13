import express from 'express';
import { 
    createProductSkuSchema,
    createProductVariantSchema,
    updateProductSkuSchema,
    variantImageSchema
} from './variants.validator';
import { variantsController } from './variants.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';

const variantsRouter = express.Router();

variantsRouter.post(
    '/product/:productId',
    validationMiddleware.validateRequest(createProductVariantSchema),
    variantsController.createVariants
)

variantsRouter.patch(
    '/:variantId/image',
    validationMiddleware.validateRequest(variantImageSchema),
    variantsController.updateVariantImage
)

variantsRouter.get(
    '/product/:productId',
    variantsController.getVariants
)

variantsRouter.delete(
    '/:variantId',
    variantsController.deleteVariant
)

variantsRouter.post(
    '/:variantId/sku',
    validationMiddleware.validateRequest(createProductSkuSchema),
    variantsController.createProductSku
)

variantsRouter.patch(
    '/sku/:skuId',
    validationMiddleware.validateRequest(updateProductSkuSchema),
    variantsController.updateProductSku
)

export default variantsRouter;