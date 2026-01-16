import { Response, Router } from "express";
import { cashfreeWebhookController } from "./payment.controller";

const router = Router();

router.post('/webhook', cashfreeWebhookController)

export default router;