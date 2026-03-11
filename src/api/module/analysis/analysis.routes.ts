import exporess from 'express'
import { analysisController } from './analysis.controller';
import { revenueAnalysisQuerySchema, statusAnalysisQuerySchema } from './analysis.validator';

import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';

const analysisRouter = exporess.Router();

analysisRouter.get(
    '/overview-matrix',
    adminMiddleware,
    analysisController.getOverviewMatrix
)

analysisRouter.get(
    '/revenue',
    adminMiddleware,
    validationMiddleware.validateQuery(revenueAnalysisQuerySchema),
    analysisController.getRevenueAnalysis
)

analysisRouter.get(
    '/status',
    adminMiddleware,
    validationMiddleware.validateQuery(statusAnalysisQuerySchema),
    analysisController.getStatusAnalysis
)

analysisRouter.get(
    '/brand-and-attributes/count',
    adminMiddleware,
    analysisController.getBrandAtrributeCount
)

export default analysisRouter;