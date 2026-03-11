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
        orderUid: string;
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
                orderUid: data.orderUid,
                amount: data.amount,
                cfStatus: data.cfStatus,
                cfOrderId: data.cfOrderId,
                orderCreatedAt: data.orderCreatedAt,
                paymentSessionId: data.paymentSessionId,
            }
        });
    }

    public async findOrderAndPayment(orderUid: string, tx: PrismaTx = prisma) {
        return await tx.payment.findUnique({
            where: { orderUid },
            include: {
                order: true
            }
        });
    }

    public async updateOrderIfPending(orderId: string, data: OrderUpdateInput ,tx: PrismaTx = prisma) {
        return await tx.order.updateMany({
            where: { id: orderId, status: "PENDING" },
            data,
        });
    }

    public async updatePaymentIfActive(id: string, data: PaymentUpdateInput ,tx: PrismaTx = prisma) {
        return await tx.payment.updateMany({
            where: { id, cfStatus: "ACTIVE" },
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

    public async countOrders(where: OrderWhereInput = {}) {
        return prisma.order.count({ where });
    }

    public async findOrderDetails(orderId: string, tx: PrismaTx = prisma) {
        return await tx.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                totalAmount: true,
                currency: true,
                status: true,
                confirmedAt: true,
                userId: true,
                createdAt: true,
                customerDetails: {
                    select: {
                        name: true,
                        email: true,
                        mobile: true,
                        note: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        country: true
                    }
                },
                orderItems : {
                    select : {
                        productId :true,
                        productName :true, 
                        productSlug :true, 
                        size :true, 
                        color :true, 
                        material :true, 
                        price :true, 
                        quantity :true, 
                        totalPrice:true,
                    }
                },
                payments : {
                    select : {
                        amount:true,
                        cfStatus:true,
                        orderCreatedAt:true,
                    }
                }
            }
        });
    }

    public async findOrder(orderId: string, tx: PrismaTx = prisma) {
        return await tx.order.findUnique({
            where: { id: orderId },
        });
    }

    public async findOrderItems(orderId: string, tx: PrismaTx = prisma) {
        return await tx.orderItem.findMany({
            where: { orderId },
        });
    }

    public async findCustomerDetails(orderId: string, tx: PrismaTx = prisma) {
        return await tx.customerDetails.findUnique({
            where: { orderId },
        });
    }

    public async findProductFromUserOrders(userId: string, productId: string, tx: PrismaTx = prisma) {
        return await tx.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId,
                    status: "DELIVERED",
                },
                product: {
                    status: "ACTIVE",
                }
            },
            include: {
                product: true
            }
        });
    }

    public async findPayment(paymentId: string, tx: PrismaTx = prisma) {
        return await tx.payment.findUnique({
            where: { id: paymentId },
        });
    }
}

export const orderRepository = new OrderRepository();