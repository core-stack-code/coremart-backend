import express from 'express';
import { attributesController } from './attributes.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { colorAttributeSchema, materialAttributeSchema, sizeAttributeSchema } from './attributes.validator';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const attributesRouter = express.Router();

attributesRouter.get(
    '/size',
    adminMiddleware,
    asyncWrapper(attributesController.getSizeList)
);

attributesRouter.get(
    '/color',
    adminMiddleware,
    asyncWrapper(attributesController.getColorList)
);

attributesRouter.get(
    '/material',
    adminMiddleware,
    asyncWrapper(attributesController.getMaterialList)
);

attributesRouter.get(
    '/active-list',
    adminMiddleware,
    asyncWrapper(attributesController.getAttibutes)
);

attributesRouter.post(
    '/size',
    adminMiddleware,
    validationMiddleware.validateRequest(sizeAttributeSchema),
    asyncWrapper(attributesController.createSize)
);

attributesRouter.patch(
    '/size/:id',
    adminMiddleware,
    validationMiddleware.validateRequest(sizeAttributeSchema),
    asyncWrapper(attributesController.updateSize)
);

attributesRouter.patch(
    '/size/:id/deactivate',
    adminMiddleware,
    asyncWrapper(attributesController.deactivateSize)
);

attributesRouter.post(
    '/color',
    adminMiddleware,
    validationMiddleware.validateRequest(colorAttributeSchema),
    asyncWrapper(attributesController.createColor)
);

attributesRouter.patch(
    '/color/:id',
    adminMiddleware,
    validationMiddleware.validateRequest(colorAttributeSchema),
    asyncWrapper(attributesController.updateColor)
);

attributesRouter.patch(
    '/color/:id/deactivate',
    adminMiddleware,
    asyncWrapper(attributesController.deactivateColor)
);

attributesRouter.post(
    '/material',
    adminMiddleware,
    validationMiddleware.validateRequest(materialAttributeSchema),
    asyncWrapper(attributesController.createMaterial)
);

attributesRouter.patch(
    '/material/:id',
    adminMiddleware,
    validationMiddleware.validateRequest(materialAttributeSchema),
    asyncWrapper(attributesController.updateMaterial)
);

attributesRouter.patch(
    '/material/:id/deactivate',
    adminMiddleware,
    asyncWrapper(attributesController.deactivateMaterial)
);

export default attributesRouter;