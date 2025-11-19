import { z } from "zod";
import { Types } from "mongoose";

export const checkoutSchema = z.object({
    addressId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid address ID',
        }),
})

export type CheckoutPayload = z.infer<typeof checkoutSchema>;