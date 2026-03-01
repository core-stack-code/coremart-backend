import express from 'express';
import { attributesController } from './attributes.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { 
    createColorSchema, createMaterialSchema, createSizeSchema, updateColorSchema, updateMaterialSchema, updateSizeSchema
} from './attributes.validator';
import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { asyncWrapper } from '@core/utils/asyncWrapper';

const attributesRouter = express.Router();

attributesRouter.use(adminMiddleware);

attributesRouter.get(
    '/active-list',
    asyncWrapper(attributesController.getAttibutes)
);

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

attributesRouter.post(
    '/size',
    validationMiddleware.validateRequest(createSizeSchema),
    asyncWrapper(attributesController.createSize)
);

attributesRouter.patch(
    '/size/:id',
    validationMiddleware.validateRequest(updateSizeSchema),
    asyncWrapper(attributesController.updateSize)
);

attributesRouter.post(
    '/color',
    validationMiddleware.validateRequest(createColorSchema),
    asyncWrapper(attributesController.createColor)
);

attributesRouter.patch(
    '/color/:id',
    validationMiddleware.validateRequest(updateColorSchema),
    asyncWrapper(attributesController.updateColor)
);

attributesRouter.post(
    '/material',
    validationMiddleware.validateRequest(createMaterialSchema),
    asyncWrapper(attributesController.createMaterial)
);

attributesRouter.patch(
    '/material/:id',
    validationMiddleware.validateRequest(updateMaterialSchema),
    asyncWrapper(attributesController.updateMaterial)
);

export default attributesRouter;