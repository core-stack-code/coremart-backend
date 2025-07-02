import { Types } from "mongoose";
import { z } from "zod";

export const toggleFavoriteSchema = z.object({
    productId: z
        .string()
        .refine((val) => Types.ObjectId.isValid(val), {
            message: 'Invalid product ID',
        }),
}).strict()

export type ToggleFavoriteSchema = z.infer<typeof toggleFavoriteSchema>;