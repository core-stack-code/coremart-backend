import { OrderListQuery, OrderStatusPayload, PaymentStatusPayload } from "./orderManagment.validator";
import { orderManagmentRepository } from "./orderManagment.repository";
import { AppError } from "@api/utils/response";


class OrderManagmentService {
    public async getOrdersList(query: OrderListQuery) {
        const skip = (query.page - 1) * query.limit
        const take = query.limit

        const orders = await orderManagmentRepository.findMany(skip, take);
        const total = await orderManagmentRepository.count();

        const orderList = orders.map(ord => {
            const { _count, ...rest } = ord;

            return {
                ...rest,
                orderItemsCount: _count.orderItems
            }
        })

        const totalPages = Math.ceil(total / take)

        return {
            orders: orderList,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalPages,
                totalItems: total,
                isPrevPage: query.page > 1,
                isNextPage: query.page < totalPages,
            },
        }
    }

    public async getOrderDetails (orderId: string) {
        const order = await orderManagmentRepository.findDetails(orderId);

        if (!order) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Order not found")
        }

        const { user, orderItems, customerDetails, payments,...rest } = order

        const items = orderItems.map(oi => {
            const { product, ...restItem } = oi
            const { productImages, ...restProduct } = product

            const thumbnailImage = productImages.find(img => img.type === "THUMBNAIL")

            return {
                ...restItem,
                product: {
                    ...restProduct,
                    thumbnailImage: thumbnailImage ? {
                        url: thumbnailImage.url,
                        altText: thumbnailImage.altText,
                    } : null
                }
            }
        })
        
        return {
            order: { ...rest },
            user,
            payments,
            orderItems: items,
            customerDetails,
        }
    }

    public async changeOrderStatus (orderId: string, payload: OrderStatusPayload) {
        const order = await orderManagmentRepository.findOneOrder(orderId)

        if (!order) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Order not found")
        }

        if (order.status === payload.orderStatus) {
            throw new AppError(400, "BAD_REQUEST", "Order is already in the specified status")
        }

        if (order.status === "DELIVERED") {
            throw new AppError(400, "BAD_REQUEST", "Cannot change status of a delivered order")
        }

        await orderManagmentRepository.updateOrder(orderId, {
            status: payload.orderStatus
        })
    }

    public async changePaymentStatus (paymentId: string, orderId: string, payload: PaymentStatusPayload) {
        const payment = await orderManagmentRepository.findOnePayment(paymentId)

        if (!payment || payment.orderId !== orderId) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Payment not found for the specified order")
        }

        if (payment.cfStatus === payload.paymentStatus) {
            throw new AppError(400, "BAD_REQUEST", "Payment is already in the specified status")
        }

        await orderManagmentRepository.updatePayment(paymentId, {
            cfStatus: payload.paymentStatus
        })
    }
}

export const orderManagmentService = new OrderManagmentService();