import { z } from "zod";

export const createProductCategorySchema = z.object({
    categoryId: z.string().trim(),
});

export type CreateProductCategoryPayload = z.infer<typeof createProductCategorySchema>;