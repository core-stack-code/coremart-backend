import { Request, Response } from "express"
import { OrderListQuery, OrderStatusPayload, PaymentStatusPayload } from "./orderManagment.validator"
import { orderManagmentService } from "./orderManagment.service";
import { AppResponse } from "@api/utils/response";


class OrderMangementController {
    public async orderList (req: Request, res: Response) {
        const query = req.localsQuery as OrderListQuery;

        const result = await orderManagmentService.getOrdersList(query)

        AppResponse(res, 200, {
            code: "OK",
            message: "Orders retrieved successfully",
            data: result
        })
    }

    public async orderDetails (req: Request, res: Response) {
        const orderId = req.params.orderId
        
        const result = await orderManagmentService.getOrderDetails(orderId)

        AppResponse(res, 200, {
            code: "OK",
            message: "Order details retrieved successfully",
            data: result
        })
    }

    public async changeOrderStatus (req: Request, res: Response) {
        const orderId = req.params.orderId
        const payload = req.body as OrderStatusPayload

        await orderManagmentService.changeOrderStatus(orderId, payload)

        AppResponse(res, 200, {
            code: "OK",
            message: "Order status updated successfully"
        })
    }

    public async changePaymentStatus (req: Request, res: Response) {
        const orderId = req.params.orderId
        const paymentId = req.params.paymentId
        const payload = req.body as PaymentStatusPayload

        await orderManagmentService.changePaymentStatus(paymentId, orderId, payload)

        AppResponse(res, 200, {
            code: "OK",
            message: "Payment status updated successfully"
        })
    }
}

export const orderManagmentController =  new OrderMangementController()