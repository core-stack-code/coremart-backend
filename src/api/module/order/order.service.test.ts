import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = {};

vi.mock("@core/config/prisma", () => ({
    prisma: {
        $transaction: vi.fn(async (callback) => callback(tx)),
    },
}));

vi.mock("@mod/cart/cart.service", () => ({
    cartService: {
        checkCart: vi.fn(),
    },
}));

vi.mock("@mod/cart/cart.repository", () => ({
    cartRepository: {
        clearCart: vi.fn(),
        findCartItems: vi.fn(),
    },
}));

vi.mock("@mod/variants/variants.repository", () => ({
    variantsRepository: {
        findActiveSkus: vi.fn(),
    },
}));

vi.mock("@mod/address/address.repository", () => ({
    MAX_ADDRESS_COUNT: 5,
    addressRepository: {
        count: vi.fn(),
        create: vi.fn(),
        findOne: vi.fn(),
    },
}));

vi.mock("@core/integrations/cashfree/cashfree.client", () => ({
    createCashfreeOrder: vi.fn(),
    verifyCashFreeWebhookSignature: vi.fn(),
}));

vi.mock("./order.repository", () => ({
    orderRepository: {
        countOrders: vi.fn(),
        createCustomerDetails: vi.fn(),
        createOrder: vi.fn(),
        createOrderItems: vi.fn(),
        createPayment: vi.fn(),
        findCustomerDetails: vi.fn(),
        findOrder: vi.fn(),
        findOrderList: vi.fn(),
        findOrderItems: vi.fn(),
    },
}));

vi.mock("./order.utils", () => ({
    addOrderExpirationJob: vi.fn(),
    addPaymentExpirationJob: vi.fn(),
}));

vi.mock("@core/lib/jobs/queue", () => ({
    emailQueue: {
        add: vi.fn(),
    },
    QUEUE_JOBS: {
        ORDER_CONFIRM: "ORDER_CONFIRM",
    },
}));

import { prisma } from "@core/config/prisma";
import { createCashfreeOrder } from "@core/integrations/cashfree/cashfree.client";
import { addressRepository } from "@mod/address/address.repository";
import { cartRepository } from "@mod/cart/cart.repository";
import { cartService } from "@mod/cart/cart.service";
import { variantsRepository } from "@mod/variants/variants.repository";
import { addOrderExpirationJob, addPaymentExpirationJob } from "./order.utils";
import { orderRepository } from "./order.repository";
import { orderService } from "./order.service";

const user = {
    id: "user-1",
    email: "user@example.com",
} as Parameters<typeof orderService.handleCheckout>[0];

const checkoutPayload = {
    customer: {
        name: "Test User",
        mobile: "+919876543210",
    },
    note: "Leave near the door",
    addressId: null,
    newAddress: {
        addressLine1: "221B Baker Street",
        addressLine2: "Floor 2",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India",
    },
    isSaveAddress: true,
} as Parameters<typeof orderService.handleCheckout>[1];

describe("orderService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("handleCheckout", () => {
        it("rejects when cart is empty", async () => {
            vi.mocked(cartService.checkCart).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartService.checkCart>>);
            vi.mocked(cartRepository.findCartItems).mockResolvedValue([]);

            await expect(
                orderService.handleCheckout(user, checkoutPayload),
            ).rejects.toThrow("Cart is empty");

            expect(createCashfreeOrder).not.toHaveBeenCalled();
            expect(orderRepository.createOrder).not.toHaveBeenCalled();
        });

        it("creates order, payment, and returns Cashfree payment session id", async () => {
            vi.mocked(cartService.checkCart).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartService.checkCart>>);
            vi.mocked(cartRepository.findCartItems).mockResolvedValue([
                {
                    quantity: 2,
                    sku: {
                        id: "sku-1",
                        price: 50000,
                        variant: {
                            color: { name: "Black" },
                            size: { name: "M" },
                            material: { name: "Cotton" },
                            product: {
                                id: "product-1",
                                name: "Core Tee",
                                slug: "core-tee",
                            },
                        },
                    },
                },
            ] as Awaited<ReturnType<typeof cartRepository.findCartItems>>);
            vi.mocked(variantsRepository.findActiveSkus).mockResolvedValue([
                {
                    id: "sku-1",
                    stock: 5,
                    price: 50000,
                },
            ] as Awaited<ReturnType<typeof variantsRepository.findActiveSkus>>);
            vi.mocked(orderRepository.createOrder).mockResolvedValue({
                id: "order-1",
                userId: "user-1",
                totalAmount: 100000,
                currency: "INR",
            } as Awaited<ReturnType<typeof orderRepository.createOrder>>);
            vi.mocked(orderRepository.createOrderItems).mockResolvedValue({ count: 1 });
            vi.mocked(addressRepository.count).mockResolvedValue(0);
            vi.mocked(addressRepository.create).mockResolvedValue({} as Awaited<
                ReturnType<typeof addressRepository.create>
            >);
            vi.mocked(orderRepository.createCustomerDetails).mockResolvedValue({
                name: "Test User",
                email: "user@example.com",
                mobile: "+919876543210",
            } as Awaited<ReturnType<typeof orderRepository.createCustomerDetails>>);
            vi.mocked(createCashfreeOrder).mockResolvedValue({
                order_id: "cf-order-uid",
                order_amount: 1000,
                order_currency: "INR",
                order_status: "ACTIVE",
                cf_order_id: "12345",
                created_at: "2026-06-03T12:00:00Z",
                payment_session_id: "payment-session-1",
                customer_details: {
                    customer_id: "user-1",
                    customer_name: "Test User",
                    customer_phone: "+919876543210",
                    customer_email: "user@example.com",
                    customer_uid: null,
                },
                order_meta: {
                    notify_url: null,
                    return_url: null,
                },
            });
            vi.mocked(orderRepository.createPayment).mockResolvedValue({
                id: "payment-1",
            } as Awaited<ReturnType<typeof orderRepository.createPayment>>);

            const result = await orderService.handleCheckout(user, checkoutPayload);

            expect(prisma.$transaction).toHaveBeenCalledTimes(2);
            expect(orderRepository.createOrder).toHaveBeenCalledWith({
                userId: "user-1",
                totalAmount: 100000,
                currency: "INR",
            }, tx);
            expect(orderRepository.createOrderItems).toHaveBeenCalledWith(
                "order-1",
                [
                    expect.objectContaining({
                        skuId: "sku-1",
                        productId: "product-1",
                        price: 50000,
                        quantity: 2,
                        totalPrice: 100000,
                    }),
                ],
                tx,
            );
            expect(createCashfreeOrder).toHaveBeenCalledWith(
                expect.objectContaining({
                    order_amount: 1000,
                    order_currency: "INR",
                    customer_details: expect.objectContaining({
                        customer_id: "user-1",
                        customer_email: "user@example.com",
                    }),
                }),
            );
            expect(orderRepository.createPayment).toHaveBeenCalledWith(
                "order-1",
                expect.objectContaining({
                    orderUid: "cf-order-uid",
                    amount: 1000,
                    paymentSessionId: "payment-session-1",
                }),
                tx,
            );
            expect(addOrderExpirationJob).toHaveBeenCalledWith("order-1");
            expect(addPaymentExpirationJob).toHaveBeenCalledWith("payment-1");
            expect(result).toEqual({ paymentSessionId: "payment-session-1" });
        });
    });

    describe("retryPayment", () => {
        it("rejects when order has expired", async () => {
            vi.mocked(orderRepository.findOrder).mockResolvedValue({
                id: "order-1",
                userId: "user-1",
                status: "EXPIRED",
            } as Awaited<ReturnType<typeof orderRepository.findOrder>>);

            await expect(
                orderService.retryPayment("user-1", "order-1"),
            ).rejects.toThrow("Order has expired, cannot retry payment");

            expect(createCashfreeOrder).not.toHaveBeenCalled();
            expect(orderRepository.createPayment).not.toHaveBeenCalled();
        });
    });

    describe("orderList", () => {
        it("returns mapped orders with pagination", async () => {
            const createdAt = new Date("2026-06-03T12:00:00Z");

            vi.mocked(orderRepository.findOrderList).mockResolvedValue([
                {
                    id: "order-1",
                    totalAmount: 100000,
                    currency: "INR",
                    status: "PENDING",
                    confirmedAt: null,
                    createdAt,
                    payments: [
                        {
                            cfStatus: "ACTIVE",
                            amount: 1000,
                        },
                    ],
                    _count: {
                        orderItems: 2,
                    },
                },
            ] as Awaited<ReturnType<typeof orderRepository.findOrderList>>);
            vi.mocked(orderRepository.countOrders).mockResolvedValue(1);

            const result = await orderService.orderList("user-1", {
                page: 1,
                limit: 10,
                status: "PENDING",
                sort: "NEW_FIRST",
            });

            expect(orderRepository.findOrderList).toHaveBeenCalledWith({
                where: {
                    userId: "user-1",
                    status: "PENDING",
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: 0,
                take: 10,
            });
            expect(result.orders).toEqual([
                {
                    id: "order-1",
                    totalAmount: 100000,
                    currency: "INR",
                    status: "PENDING",
                    confirmedAt: null,
                    createdAt,
                    itemCount: 2,
                    payments: [
                        {
                            stuatu: "ACTIVE",
                            amount: 1000,
                        },
                    ],
                },
            ]);
            expect(result.pagination.totalItems).toBe(1);
        });
    });
});
