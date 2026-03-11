import { prisma } from "@core/config/prisma";
import { OrderUpdateInput, PaymentUpdateInput } from "generated/prisma/models";


class OrderManagmentRepository {
    public async findMany(skip: number, take: number) {
        return await prisma.order.findMany({
            skip,
            take,
            orderBy: {
                createdAt: "asc"
            },
            select: {
                id: true,
                status: true,
                totalAmount: true,
                createdAt: true,
                confirmedAt: true,
                discountAmount: true,
                customerDetails: {
                    select: {
                        mobile: true,
                        email: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        orderItems: true
                    }
                }
            }
        })
    }

    public async count() {
        return await prisma.order.count()
    }

    public async findDetails(orderId: string) {
        return await prisma.order.findUnique({
            where: { id: orderId },
            select: {
                id: true,
                confirmedAt: true,
                currency: true,
                totalAmount: true,
                status: true,
                discountAmount: true,
                createdAt: true,
                customerDetails: {
                    select: {
                        id: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        country: true,
                        createdAt: true,
                        email: true,
                        mobile: true,
                        name: true,
                        note: true,
                        postalCode: true,
                        state: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                orderItems: {
                    select: {
                        id: true,
                        size: true,
                        color: true,
                        material: true,
                        price: true,
                        quantity: true,
                        totalPrice: true,
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                status: true,
                                brand: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                },
                                productImages: {
                                    select: {
                                        url: true,
                                        altText: true,
                                        type: true,
                                        createdAt: true,
                                    }
                                },
                            }
                        },
                    }
                },
                payments: {
                    select: {
                        amount: true,
                        cfOrderId: true,
                        cfStatus: true,
                        createdAt: true,
                        id: true,
                        orderUid: true,
                        paymentSessionId: true,
                        webhookPayload: true
                    }
                }
            }
        })
    }

    public async findOneOrder (orderId: string) {
        return await prisma.order.findUnique({
            where: { id: orderId },
        })
    }

    public async updateOrder(orderId: string, data: OrderUpdateInput) {
        return await prisma.order.update({
            where: { id: orderId },
            data
        })
    }

    public async findOnePayment(paymentId: string) {
        return await prisma.payment.findUnique({
            where: { id: paymentId },
        })
    }

    public async updatePayment(paymentId: string, data: PaymentUpdateInput) {
        return await prisma.payment.update({
            where: { id: paymentId },
            data
        })
    }

    public async totalRevenue(startData?: Date, endDate?: Date) {
        return await prisma.order.aggregate({
            _sum: {
                totalAmount: true,
            },
            where: {
                status: {
                    in: ["CONFIRMED", "SHIPPED", "DELIVERED"],
                },
                createdAt: {
                    gte: startData,
                    lte: endDate,
                }
            }
        })
    }

    public async groupByOrderStatus() {
        return prisma.order.groupBy({
            by: ["status"],
            _count: {
                status: true
            }
        })
    }

    public async groupByPaymentStatus() {
        return prisma.payment.groupBy({
            by: ["cfStatus"],
            _count: {
                cfStatus: true
            }
        })
    }
}

export const orderManagmentRepository = new OrderManagmentRepository();