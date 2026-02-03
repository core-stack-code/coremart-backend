import express from 'express';
import { attributesController } from './attributes.controller';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';
import { colorAttributeSchema, materialAttributeSchema, sizeAttributeSchema } from './attributes.validator';

const attributesRouter = express.Router();

attributesRouter.get(
    '/size',
    attributesController.getSizeList
)

attributesRouter.get(
    '/color',
    attributesController.getColorList
)

attributesRouter.get(
    '/material',
    attributesController.getMaterialList
)

attributesRouter.get(
    '/active-list',
    attributesController.getAttibutes
)

attributesRouter.post(
    '/size',
    validationMiddleware.validateRequest(sizeAttributeSchema),
    attributesController.createSize
)

attributesRouter.patch(
    '/size/:id',
    validationMiddleware.validateRequest(sizeAttributeSchema),
    attributesController.updateSize
)

attributesRouter.patch(
    '/size/:id/deactivate',
    attributesController.deactivateSize
)

attributesRouter.post(
    '/color',
    validationMiddleware.validateRequest(colorAttributeSchema),
    attributesController.createColor
)

attributesRouter.patch(
    '/color/:id',
    validationMiddleware.validateRequest(colorAttributeSchema),
    attributesController.updateColor
)

attributesRouter.patch(
    '/color/:id/deactivate',
    attributesController.deactivateColor
)

attributesRouter.post(
    '/material',
    validationMiddleware.validateRequest(materialAttributeSchema),
    attributesController.createMaterial
)

attributesRouter.patch(
    '/material/:id',
    validationMiddleware.validateRequest(materialAttributeSchema),
    attributesController.updateMaterial
)

attributesRouter.patch(
    '/material/:id/deactivate',
    attributesController.deactivateMaterial
)

export default attributesRouter;