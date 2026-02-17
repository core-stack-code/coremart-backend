import { z } from "zod";

export const updateCartItemSchema = z.object({
    quantity: z.number().int().nonnegative(),
});

export type UpdateCartItemPayload = z.infer<typeof updateCartItemSchema>;