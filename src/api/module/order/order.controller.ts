import { Request, Response } from "express";
import { orderService } from "./order.service";
import { CheckoutPayload, OrderListQuery } from "./order.validator";
import { AppError, AppResponse } from "@core/utils/response";
import { log } from "@api/utils/log";


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

        log.info("Received payment webhook with body:", rawBody);

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

    public async getOrders(req: Request, res: Response) {
        const user = req.user!;
        const query = req.localsQuery as OrderListQuery;

        const result = await orderService.orderList(user.id, query);

        AppResponse(res, 200, {
            code: "OK",
            message: "Orders retrieved successfully",
            data: result
        });
    }
}

export const orderController = new OrderController();