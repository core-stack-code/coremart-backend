import { prisma, PrismaTx } from "@core/config/prisma";
import { Order, User } from "generated/prisma/client";
import { OrderOrderByWithRelationInput, OrderWhereInput, ProductWhereInput } from "generated/prisma/models";

import { OrderItem, orderRepository, ShippingAddress } from "./order.repository";
import { CheckoutPayload, OrderListQuery } from "./order.validator";
import { cartService } from "@mod/cart/cart.service";
import { cartRepository } from "@mod/cart/cart.repository";
import { variantsRepository } from "@mod/variants/variants.repository";
import { addressRepository, MAX_ADDRESS_COUNT } from "@mod/address/address.repository";
import { catalogRepository } from "@mod/catalog/catalog.repository";

import { createCashfreeOrder } from "@core/integrations/cashfree/cashfree.client";
import { CashFreeCreateOrderResponse, CashfreePaymentWebhookPayload } from "@core/integrations/cashfree/type";
import { verifyCashFreeWebhookSignature } from "@core/integrations/cashfree/cashfree.client";
import { formatProductListItem, paiseToRupees } from "@core/utils/product.helper";
import { AppError } from "@api/utils/response";
import { PaginationType } from "@core/types/common";
import { getUuid } from "@core/utils/db.helper";
import { addOrderExpirationJob, addPaymentExpirationJob } from "./order.utils";
import { emailQueue, QUEUE_JOBS } from "@core/lib/jobs/queue";

type ItemQuantityMap = Map<string, { quantity: number }>;


class OrderService {
    public async handleCheckout(user: User, payload: CheckoutPayload) {
        const { order, customer } = await prisma.$transaction(async (tx) => {
            return await this.createOrder(user, payload, tx);
        });

        const response = await this.cashfreeCreateOrder(order, user.id,customer);

        await prisma.$transaction(async (tx) => {
            await this.createPayment(order.id, response, tx);
        });

        return { paymentSessionId: response.payment_session_id };
    }

    private async createOrder(user: User, payload: CheckoutPayload, tx: PrismaTx = prisma) {
        await cartService.checkCart(user.id, tx);

        const cartItemsResult = await cartRepository.findCartItems(user.id, tx);

        if (cartItemsResult.length === 0) {
            throw new AppError(400, "BAD_REQUEST", "Cart is empty");
        }

        const skuIds = cartItemsResult.map(item => item.sku.id);
        const cartItemsMap = new Map(cartItemsResult.map(item => [item.sku.id, {
            quantity: item.quantity,
        }]));

        await this.checkSkuStocks(skuIds, cartItemsMap, tx);

        let totalAmount = 0;

        const orderItems: OrderItem[] = cartItemsResult.map(item => {
            const { id, price, variant } = item.sku;
            const { product } = variant
            const itemTotalPrice = price * item.quantity;

            totalAmount += itemTotalPrice;

            return {
                skuId: id,
                productId: product.id,
                productName: product.name,
                productSlug: product.slug,
                color: variant.color.name,
                size: variant.size.name,
                material: variant.material.name,
                price: price,
                quantity: item.quantity,
                totalPrice: itemTotalPrice,
            }
        });

        // create order and order items
        const order = await orderRepository.createOrder({
            userId: user.id,
            totalAmount,
            currency: "INR",
        }, tx);

        await orderRepository.createOrderItems(order.id, orderItems, tx);


        // Create customer details
        let shippingAddress: ShippingAddress;
        
        if (payload.newAddress) {
            shippingAddress = {
                addressLine1: payload.newAddress.addressLine1,
                addressLine2: payload.newAddress.addressLine2 ?? null,
                city: payload.newAddress.city,
                state: payload.newAddress.state,
                postalCode: payload.newAddress.postalCode,
                country: payload.newAddress.country,
            };

            const addressCount = await addressRepository.count(user.id, tx);

            if (addressCount < MAX_ADDRESS_COUNT) {
                await addressRepository.create({
                    userId: user.id,
                    addressLine1: payload.newAddress.addressLine1,
                    addressLine2: payload.newAddress.addressLine2,
                    city: payload.newAddress.city,
                    state: payload.newAddress.state,
                    postalCode: payload.newAddress.postalCode,
                    country: payload.newAddress.country,
                }, tx);
            }
        } else {
            const address = await addressRepository.findOne(
                user.id,
                payload.addressId!,
                tx
            );

            if (!address) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Selected address not found.");
            }

            shippingAddress = address;
        }

        const customerDetails = await orderRepository.createCustomerDetails(order.id, {
            name: payload.customer.name,
            mobile: payload.customer.mobile,
            email: user.email,
            note: payload.note,
            address: shippingAddress,
        }, tx);

        await addOrderExpirationJob(order.id);

        return {
            order,
            customer : {
                name: customerDetails.name,
                email: customerDetails.email,
                mobile: customerDetails.mobile,
            }
        };
    }


    public async handleWebhook(rawBody: any, signature: string, timestamp: string) {
        const isValid = verifyCashFreeWebhookSignature(rawBody, signature, timestamp);

        if (!isValid) {
            // Invalid webhook signature
            return;
        }

        await this.updatePaymentAndOrder(rawBody);
    }

    private async updatePaymentAndOrder(rawBody: any) {
        const payload = JSON.parse(rawBody) as CashfreePaymentWebhookPayload;

        if (!payload.data.order) {
            // Invalid webhook payload: missing data
            return;
        }

        const { 
            order: orderData,
            payment: paymentData,
            customer_details
        } = payload.data;

        await prisma.$transaction(async (tx) => {
            const data = await orderRepository.findOrderAndPayment(orderData.order_id, tx);
    
            if (!data) {
                // Order Or Payment not found for the given order ID
                return;
            }

            const { order, ...rest } = data;
            const payment = rest;

            if (payment.cfStatus !== "ACTIVE") {
                return;
            }

            const isPaymentSuccess = paymentData.payment_status === "SUCCESS"

            const paymentUpdate = await orderRepository.updatePaymentIfActive(payment.id, {
                webhookPayload: rawBody,
                cfStatus: isPaymentSuccess ? "PAID" : "EXPIRED",
            }, tx);


            if (paymentUpdate.count === 0) {
                return;
            }

            if (!isPaymentSuccess) {
                // Payment failed, do not update order status or clear cart or change stock
                return;
            }

            const updatedOrderResult = await orderRepository.updateOrderIfPending(order.id, {
                status: "CONFIRMED",
                confirmedAt: new Date(paymentData.payment_time),
            }, tx);

            const wasConfirmedNow = updatedOrderResult.count === 1;

            if (!wasConfirmedNow) {
                // Order was already confirmed or cancelled, do not clear cart or change stock
                return;
            }

            const cart = await cartService.checkCart(order.userId, tx);
            await cartRepository.clearCart(cart.id, tx);

            // const orderItems = await orderRepository.findOrderItems(order.id, tx);

            // send order confirm mail
            await emailQueue.add(QUEUE_JOBS.ORDER_CONFIRM, {
                to: customer_details.customer_email,
                confirmedAt: new Date(paymentData.payment_time),
                totalAmount: order.totalAmount,
                orderId: order.id,
            }, {
                attempts: 5,
                backoff: {
                    type: "exponential",
                    delay: 5000
                },
                removeOnComplete: true,
                removeOnFail: false
            })
        });
    }


    public async orderList(userId: string, query: OrderListQuery) {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const where: OrderWhereInput = {
            userId,
            status: query.status,
        }

        const orderBy: OrderOrderByWithRelationInput = {
            createdAt: query.sort === "NEW_FIRST" ? "desc" : "asc",
        };

        const orderResult = await orderRepository.findOrderList({
            where,
            orderBy,
            skip,
            take,
        });

        const total = await orderRepository.countOrders(where);


        const orders = orderResult.map(order => {
            const payments = order.payments.map(payment => ({
                stuatu: payment.cfStatus,
                amount: payment.amount
            }))

            return {
                id: order.id,
                totalAmount: order.totalAmount,
                currency: order.currency,
                status: order.status,
                confirmedAt: order.confirmedAt,
                createdAt: order.createdAt,
                itemCount: order._count.orderItems,
                payments
            }
        });

        const totalPages = Math.ceil(total / query.limit);

        const pagination: PaginationType = {
            page: query.page,
            limit: query.limit,
            totalPages,
            totalItems: total,
            isPrevPage: query.page > 1,
            isNextPage: query.page < totalPages,
        }
        
        return { orders, pagination };
    }


    public async orderDetails(userId: string, orderId: string) {
        const order = await orderRepository.findOrderDetails(orderId);

        if (!order || order.userId !== userId) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Order not found");
        }

        const productIds = order.orderItems.map(item => item.productId);

        const productWhere: ProductWhereInput = {
            id: { in: productIds },
            status: "ACTIVE",
        }

        const products = await catalogRepository.findProducts({
            where: productWhere,
            orderBy: { createdAt: "desc" },
            skip: 0,
            take: productIds.length,
        })

        const formattedProducts = formatProductListItem(products, false, false);

        const productMap = new Map(formattedProducts.map(p => [p.id, p]));

        const { orderItems, ...orderDetails } = order;

        const formatedOrderItems = orderItems.map(item => {
            const product = productMap.get(item.productId);

            return {
                ...item,
                price: paiseToRupees(item.price),
                brand: product?.brand ?? null,
                thumbnail: product?.thumbnail ?? null,
                description: product?.description ?? null,
            }
        });

        return { ...orderDetails, orderItems: formatedOrderItems };
    }


    public async retryPayment(userId: string, orderId: string) {
        const { order, customer } = await prisma.$transaction(async (tx) => {
            const order = await orderRepository.findOrder(orderId, tx);
    
            if (!order || order.userId !== userId) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Order not found");
            }
    
            if (order.status === "EXPIRED") {
                throw new AppError(400, "BAD_REQUEST", "Order has expired, cannot retry payment");
            }

            if (order.status !== "PENDING") {
                throw new AppError(400, "BAD_REQUEST", "Order has already been processed or completed, cannot retry payment");
            }
    
            const orderItems = await orderRepository.findOrderItems(order.id, tx);
            
            const skuIds = orderItems.map(item => item.skuId);
            const orderItemsMap: ItemQuantityMap = new Map(orderItems.map(item => [item.skuId, {
                quantity: item.quantity,
            }]));
    
            await this.checkSkuStocks(skuIds, orderItemsMap, tx);
            
            const customerDetails = await orderRepository.findCustomerDetails(order.id, tx);
    
            if (!customerDetails) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Customer details not found for the order");
            }

            return {
                order,
                customer : {
                    name: customerDetails.name,
                    email: customerDetails.email,
                    mobile: customerDetails.mobile,
                }
            }
        });

        const result = await this.cashfreeCreateOrder(order, userId, {
            name: customer.name,
            email: customer.email,
            mobile: customer.mobile,
        });

        await prisma.$transaction(async (tx) => {
            await this.createPayment(order.id, result, tx);
        });

        return { paymentSessionId: result.payment_session_id };
    }


    private async checkSkuStocks(skuIds: string[], items: ItemQuantityMap, tx: PrismaTx) {
        const activeSkus = await variantsRepository.findActiveSkus(skuIds, tx);

        if (activeSkus.length !== skuIds.length) {
            throw new AppError(400, "BAD_REQUEST", "Some items in the order are no longer available");
        }

        const isInvalidStock = activeSkus.some(sku => {
            const item = items.get(sku.id);
            return item ? item.quantity > sku.stock : false;
        });

        if (isInvalidStock) {
            throw new AppError(400, "BAD_REQUEST", "Some items in the order exceed available stock");
        }
    }

    private async cashfreeCreateOrder(order: Order, userId: string, customer : {
        name: string;
        email: string;
        mobile: string
    }) {
        const result = await createCashfreeOrder({
            order_id: getUuid(),
            order_amount: paiseToRupees(order.totalAmount),
            order_currency: order.currency,
            customer_details: {
                customer_name: customer.name,
                customer_phone: customer.mobile,
                customer_id: userId,
                customer_email: customer.email
            },
            order_meta: {
                // TODO: will add frontend url later
                return_url: ""
            }
        })

        return result;
    }

    private async createPayment(orderId: string, paymentData: CashFreeCreateOrderResponse, tx: PrismaTx = prisma) {
        const payment = await orderRepository.createPayment(orderId, {
            orderUid: paymentData.order_id,
            amount: paymentData.order_amount,
            cfStatus: paymentData.order_status,
            cfOrderId: paymentData.cf_order_id.toString(),
            orderCreatedAt: paymentData.created_at,
            paymentSessionId: paymentData.payment_session_id,
        }, tx);

        await addPaymentExpirationJob(payment.id);

        return payment;
    }
}

export const orderService = new OrderService();