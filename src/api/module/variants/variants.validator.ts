import { z } from 'zod';

export const createProductVariantSchema = z.object({
    sizeId: z.string().trim(),
    colorId: z.string().trim(),
    materialId: z.string().trim(),
    imageUrl: z.string().trim().min(1, "Image URL must be provided").optional(),
});

export const variantImageSchema = z.object({
    imageUrl: z.string().trim().min(1, "Image URL must be provided").nullable(),
});

export const createProductSkuSchema = z.object({
    price: z.number().int().positive(),
    stock: z.number().int().nonnegative(),
    isActive: z.boolean(),
});

export const updateProductSkuSchema = z.object({
    price: z.number().int().positive().optional(),
    stock: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field (price, stock, isActive) must be provided for update"
});

export type CreateProductVariantPayload = z.infer<typeof createProductVariantSchema>;
export type VariantImagePayload = z.infer<typeof variantImageSchema>;
export type CreateProductSkuPayload = z.infer<typeof createProductSkuSchema>;
export type UpdateProductSkuPayload = z.infer<typeof updateProductSkuSchema>;