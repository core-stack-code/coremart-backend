import { z } from 'zod';
import { SizeType } from 'generated/prisma/enums';

const sizeTypeEnum: SizeType[] = [
    "ALPHA", "FREE", "NUMERIC"
] as const;

export const createSizeSchema = z.object({
    name: z.string().min(1, 'Size name is required'),
    type: z.enum(sizeTypeEnum, "Invalid size type"),
});

export const updateSizeSchema = z.object({
    name: z.string().min(1, 'Size name is required').optional(),
    type: z.enum(sizeTypeEnum, "Invalid size type").optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});


export const createColorSchema = z.object({
    name: z.string().min(1, 'Color name is required'),
});

export const updateColorSchema = z.object({
    name: z.string().min(1, 'Color name is required').optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});


export const createMaterialSchema = z.object({
    name: z.string().min(1, 'Material name is required'),
});

export const updateMaterialSchema = z.object({
    name: z.string().min(1, 'Material name is required').optional(),
    isActive: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});


export type CreateSizePayload = z.infer<typeof createSizeSchema>;
export type UpdateSizePayload = z.infer<typeof updateSizeSchema>;
export type CreateColorPayload = z.infer<typeof createColorSchema>;
export type UpdateColorPayload = z.infer<typeof updateColorSchema>;
export type CreateMaterialPayload = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialPayload = z.infer<typeof updateMaterialSchema>;