import { Types } from "mongoose";
import { z } from "zod";

export const toggleSaveForLaterSchema = z.object({
    productId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid product ID',
        }),
}).strict()

export type ToggleSaveForLaterSchema = z.infer<typeof toggleSaveForLaterSchema>;