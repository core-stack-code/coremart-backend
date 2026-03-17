import exporess from 'express'
import { analysisController } from './analysis.controller';
import { revenueAnalysisQuerySchema, statusAnalysisQuerySchema } from './analysis.validator';

import { adminMiddleware } from '@api/middlewares/admin.middleware';
import { validationMiddleware } from '@api/middlewares/validate.middlewate';

const analysisRouter = exporess.Router();

analysisRouter.use(adminMiddleware);

analysisRouter.get(
    '/overview-matrix',
    analysisController.getOverviewMatrix
)

analysisRouter.get(
    '/revenue',
    validationMiddleware.validateQuery(revenueAnalysisQuerySchema),
    analysisController.getRevenueAnalysis
)

analysisRouter.get(
    '/status',
    validationMiddleware.validateQuery(statusAnalysisQuerySchema),
    analysisController.getStatusAnalysis
)

analysisRouter.get(
    '/brand-and-attributes/count',
    analysisController.getBrandAtrributeCount
)

export default analysisRouter;