import exporess from 'express'
import { analysisController } from './analysis.controller';
import { adminMiddleware } from '@api/middlewares/admin.middleware';

const analysisRouter = exporess.Router();

analysisRouter.get(
    '/brand-and-attributes/count',
    adminMiddleware,
    analysisController.getBrandAtrributeCount
)

export default analysisRouter;