import { Request, Response } from "express";
import { orderService } from "./order.service";
import { CheckoutPayload } from "./order.validator";
import { AppError, AppResponse } from "@core/utils/response";


class OrderController {
    public async checkout(req: Request, res: Response) {
        const user = req.user!;
        const payload = req.body as CheckoutPayload;

        const result = await orderService.handleCheckout(user, payload);

        AppResponse(res, 200, {
            code: "CREATED",
            message: "Order created successfully",
            data: result
        })
    }

    public async paymentWebhook(req: Request, res: Response) {
        const rawBody = (req as any).rawBody;

        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];

        if (!signature || typeof signature !== "string" || !timestamp || typeof timestamp !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Missing webhook signature or timestamp");
        }

        await orderService.handleWebhook(rawBody, signature, timestamp);

        AppResponse(res, 200, {
            code: "OK",
            message: "Webhook received successfully",
        });
    }
}

export const orderController = new OrderController();