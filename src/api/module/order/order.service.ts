import { prisma, PrismaTx } from "@core/config/prisma";
import { Order, OrderStatus, User } from "generated/prisma/client";

import { OrderItem, orderRepository, ShippingAddress } from "./order.repository";
import { CheckoutPayload } from "./order.validator";

import { cartService } from "@mod/cart/cart.service";
import { cartRepository } from "@mod/cart/cart.repository";
import { variantsRepository } from "@mod/variants/variants.repository";
import { addressRepository } from "@mod/address/address.repository";
import { MAX_ADDRESS_COUNT } from "@mod/address/address.service";
import { createCashfreeOrder } from "@core/integrations/cashfree/cashfree.client";
import { CashFreeCreateOrderResponse, CashfreePaymentWebhookPayload } from "@core/integrations/cashfree/type";
import { verifyCashFreeWebhookSignature } from "@core/integrations/cashfree/cashfree.client";
import { AppError } from "@core/utils/response";


class OrderService {
    public async handleCheckout(user: User, payload: CheckoutPayload) {
        const { order, customer } = await prisma.$transaction(async (tx) => {
            return await this.createOrder(user, payload, tx);
        });

        const response = await this.cashfreeCreateOrder(order, customer);

        await prisma.$transaction(async (tx) => {
            await this.createPayment(order.id, response, tx);
        });

        return { paymentSessionId: response.payment_session_id };
    }

    public async handleWebhook(rawBody: any, signature: string, timestamp: string) {
        const isValid = verifyCashFreeWebhookSignature(rawBody, signature, timestamp);

        if (!isValid) {
            throw new AppError(400, "BAD_REQUEST", "Invalid webhook signature");
        }

        const payload = JSON.parse(rawBody) as CashfreePaymentWebhookPayload;

        if (!payload.data.order) {
            return;
        }

        await this.updatePaymentStatus(payload.data.order, payload.data.payment);
    }



    private async createOrder(user: User, payload: CheckoutPayload, tx: PrismaTx = prisma) {
        await cartService.checkCart(user.id, tx);

        const cartItemsResult = await cartRepository.findCartItems(user.id, tx);

        const skuIds = cartItemsResult.map(item => item.sku.id);
        const activeSkus = await variantsRepository.findActiveSkus(skuIds, tx);

        if (activeSkus.length !== skuIds.length) {
            throw new AppError(400, "BAD_REQUEST", "Some items in the cart are no longer available");
        }
        
        const isInvalidStock = activeSkus.some(sku => {
            const cartItem = cartItemsResult.find(item => item.sku.id === sku.id);
            return cartItem ? cartItem.quantity > sku.stock : false;
        });

        if (isInvalidStock) {
            throw new AppError(400, "BAD_REQUEST", "Some items in the cart exceed available stock");
        }

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

        return {
            order,
            customer : {
                name: customerDetails.name,
                email: customerDetails.email,
                mobile: customerDetails.mobile,
            }
        };
    }

    private async cashfreeCreateOrder(order: Order, customer : {
        name: string;
        email: string;
        mobile: string
    }) {
        const result = await createCashfreeOrder({
            order_id: order.id,
            order_amount: order.totalAmount,
            order_currency: order.currency,
            customer_details: {
                customer_id: order.userId,
                customer_name: customer.name,
                customer_phone: customer.mobile,
            },
            order_meta: {
                return_url: ""
            }
        })

        return result;
    }

    private async createPayment(orderId: string, paymentData: CashFreeCreateOrderResponse, tx: PrismaTx = prisma) {
        const payment = await orderRepository.createPayment(orderId, {
            amount: paymentData.order_amount,
            cfStatus: paymentData.order_status,
            cfOrderId: paymentData.cf_order_id.toString(),
            orderCreatedAt: paymentData.created_at,
            paymentSessionId: paymentData.payment_session_id,
        }, tx);

        return payment;
    }

    private async updatePaymentStatus(
        orderData: CashfreePaymentWebhookPayload["data"]["order"],
        paymentData: CashfreePaymentWebhookPayload["data"]["payment"]
    ) {
        await prisma.$transaction(async (tx) => {
            const order = await orderRepository.findOrderById(orderData.order_id, tx);
    
            if (!order) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Order not found for the given order ID");
            }
    
            const newStatus: OrderStatus = 
                paymentData.payment_status === "SUCCESS" 
                    ? "CONFIRMED"
                    : paymentData.payment_status === "FAILED"
                        ? "FAILED" : "PENDING";
    
            await orderRepository.updateOrder(order.id, {
                status: newStatus
            }, tx);

            await orderRepository.updatePayment(paymentData.cf_payment_id, {
                cfStatus: paymentData.payment_status as any,
            }, tx);
        });
    }
}

export const orderService = new OrderService();