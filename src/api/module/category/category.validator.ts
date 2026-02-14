import { z } from "zod";
import { imageAltSchema } from "@core/validator/common.validator";

export const createCategorySchema = z.object({
    name: z.string().min(2).max(50),
    bannerImageUrl: imageAltSchema("Banner Image").optional(),
    imageUrl: imageAltSchema("Category Image").optional(),
    parentId: z.string().optional(),
});

export const updateCategorySchema = z.object({
    name: z.string().min(2).max(50).optional(),
    bannerImageUrl: imageAltSchema("Banner Image").nullable().optional(),
    imageUrl: imageAltSchema("Category Image").nullable().optional(),
    parentId: z.string().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least name or parent category must be provided for update"
});


export type CreateCategoryPayload = z.infer<typeof createCategorySchema>;
export type UpdateCategoryPayload = z.infer<typeof updateCategorySchema>;