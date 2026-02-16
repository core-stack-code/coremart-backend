import express from 'express';
import { attributesController } from './attributes.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { colorAttributeSchema, materialAttributeSchema, sizeAttributeSchema } from './attributes.validator';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const attributesRouter = express.Router();

attributesRouter.use(adminMiddleware);

attributesRouter.get(
    '/size',
    asyncWrapper(attributesController.getSizeList)
);

attributesRouter.get(
    '/color',
    asyncWrapper(attributesController.getColorList)
);

attributesRouter.get(
    '/material',
    asyncWrapper(attributesController.getMaterialList)
);

attributesRouter.get(
    '/active-list',
    asyncWrapper(attributesController.getAttibutes)
);

attributesRouter.post(
    '/size',
    validationMiddleware.validateRequest(sizeAttributeSchema),
    asyncWrapper(attributesController.createSize)
);

attributesRouter.patch(
    '/size/:id',
    validationMiddleware.validateRequest(sizeAttributeSchema),
    asyncWrapper(attributesController.updateSize)
);

attributesRouter.patch(
    '/size/:id/deactivate',
    asyncWrapper(attributesController.deactivateSize)
);

attributesRouter.post(
    '/color',
    validationMiddleware.validateRequest(colorAttributeSchema),
    asyncWrapper(attributesController.createColor)
);

attributesRouter.patch(
    '/color/:id',
    validationMiddleware.validateRequest(colorAttributeSchema),
    asyncWrapper(attributesController.updateColor)
);

attributesRouter.patch(
    '/color/:id/deactivate',
    asyncWrapper(attributesController.deactivateColor)
);

attributesRouter.post(
    '/material',
    validationMiddleware.validateRequest(materialAttributeSchema),
    asyncWrapper(attributesController.createMaterial)
);

attributesRouter.patch(
    '/material/:id',
    validationMiddleware.validateRequest(materialAttributeSchema),
    asyncWrapper(attributesController.updateMaterial)
);

attributesRouter.patch(
    '/material/:id/deactivate',
    asyncWrapper(attributesController.deactivateMaterial)
);

export default attributesRouter;