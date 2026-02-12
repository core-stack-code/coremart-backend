import { z } from "zod";

export const createBrandSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long"),
});

export const updateBrandSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long")
        .optional(),
    isActive: z
        .boolean()
        .optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least name or isActive must be provided for update"
});

export type CreateBrandPayload = z.infer<typeof createBrandSchema>;
export type UpdateBrandPayload = z.infer<typeof updateBrandSchema>;
