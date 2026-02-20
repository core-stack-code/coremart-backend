import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { PaymentStatus } from "generated/prisma/enums";
import { OrderOrderByWithRelationInput, OrderUpdateInput, OrderWhereInput, PaymentUpdateInput } from "generated/prisma/models";

export type OrderItem = {
    skuId: string;
    productId: string;
    productName: string;
    productSlug: string;
    size: string;
    color: string;
    material: string;
    price: number;
    quantity: number;
    totalPrice: number;
}

export type ShippingAddress = {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}


class OrderRepository {
    public async createOrder(data: {
        userId: string;
        totalAmount: number;
        currency: string;
    }, tx: PrismaTx = prisma) {
        return await tx.order.create({
            data: {
                id: getUuid(),
                userId: data.userId,
                totalAmount: data.totalAmount,
                currency: data.currency,
            }
        });
    }

    public async createOrderItems(orderId: string, items: OrderItem[], tx: PrismaTx = prisma) {
        return tx.orderItem.createMany({
            data: items.map(item => ({
                id: getUuid(),
                orderId,
                skuId: item.skuId,
                productId: item.productId,
                productName: item.productName,
                productSlug: item.productSlug,
                size: item.size,
                color: item.color,
                material: item.material,
                price: item.price,
                quantity: item.quantity,
                totalPrice: item.totalPrice
            })),
        });
    }

    public async createCustomerDetails(orderId: string, data: {
        name: string;
        email: string;
        mobile: string;
        note?: string;
        address: ShippingAddress;
    }, tx: PrismaTx = prisma) {
        return await tx.customerDetails.create({
            data: {
                id: getUuid(),
                orderId,
                email: data.email,
                name: data.name,
                mobile: data.mobile,
                note: data.note,
                addressLine1: data.address.addressLine1,
                addressLine2: data.address.addressLine2,
                city: data.address.city,
                state: data.address.state,
                postalCode: data.address.postalCode,
                country: data.address.country,
            }
        });
    }

    public async createPayment(orderId: string, data: {
        amount: number;
        cfStatus: PaymentStatus;
        cfOrderId: string;
        orderCreatedAt: string;
        paymentSessionId: string;
    }, tx: PrismaTx = prisma) {
        return await tx.payment.create({
            data: {
                id: getUuid(),
                orderId,
                amount: data.amount,
                cfStatus: data.cfStatus,
                cfOrderId: data.cfOrderId,
                orderCreatedAt: data.orderCreatedAt,
                paymentSessionId: data.paymentSessionId,
            }
        });
    }

    public async findOrderById(orderId: string, tx: PrismaTx = prisma) {
        return await tx.order.findUnique({
            where: { id: orderId },
        });
    }

    public async updateOrder(orderId: string, data: OrderUpdateInput ,tx: PrismaTx = prisma) {
        return await tx.order.update({
            where: { id: orderId },
            data,
        });
    }

    public async updatePayment(cfOrderId: string, data: PaymentUpdateInput ,tx: PrismaTx = prisma) {
        return await tx.payment.update({
            where: { cfOrderId },
            data,
        });
    }

    public async findOrderList(args: {
        where: OrderWhereInput
        orderBy: OrderOrderByWithRelationInput,
        skip: number,
        take: number,
    }) {
        return prisma.order.findMany({
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
            select: {
                id: true,
                totalAmount: true,
                currency: true,
                confirmedAt: true,
                status: true,
                createdAt: true,
                payments: {
                    select: {
                        cfStatus: true,
                        amount: true,
                    }
                },
                _count: {
                    select: {
                        orderItems: true,
                    }
                }
            }
        })
    }

    public async countOrders(where: OrderWhereInput) {
        return prisma.order.count({ where });
    }
}

export const orderRepository = new OrderRepository();