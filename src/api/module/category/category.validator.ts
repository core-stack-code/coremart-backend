import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2).max(50),
    parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(2).max(50).optional(),
    parentId: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least name or parent category must be provided for update"
});


export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;