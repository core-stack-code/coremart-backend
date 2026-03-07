import { z } from "zod"
import { limitQuery, pageQuery } from "@core/validator/common.validator"
import { OrderStatus, PaymentStatus } from "generated/prisma/enums"

const orderStatusEnum: OrderStatus[] = [
    "CANCELLED",
    "DELIVERED",
    "PENDING",
    "SHIPPED",
    "CONFIRMED",
    "EXPIRED"
]

const paymentStatusEnum: PaymentStatus[] = [
    "PAID",
    "ACTIVE",
    "EXPIRED"
]

export const orderListQuerySchema = z.object({
    page: pageQuery,
    limit: limitQuery(),
})

export const orderStatusSchema = z.object({
    orderStatus: z.enum(orderStatusEnum)
})

export const paymentStatusSchema = z.object({
    paymentStatus: z.enum(paymentStatusEnum)
})

export type OrderListQuery = z.infer<typeof orderListQuerySchema>
export type OrderStatusPayload = z.infer<typeof orderStatusSchema>
export type PaymentStatusPayload = z.infer<typeof paymentStatusSchema>