import { Types } from "mongoose";
import { z } from "zod";

export const commonCartPoductSchema = z.object({
    productId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid product ID',
        }),
}).strict()

export type CommonCartProduct = z.infer<typeof commonCartPoductSchema>;
