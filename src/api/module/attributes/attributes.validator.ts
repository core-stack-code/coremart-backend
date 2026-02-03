import { z } from 'zod';
import { SizeType } from 'generated/prisma/enums';

const sizeTypeEnum: SizeType[] = [
    "ALPHA", "FREE", "NUMERIC"
] as const;

export const sizeAttributeSchema = z.object({
    name: z.string().min(1, 'Size name is required'),
    type: z.enum(sizeTypeEnum, "Invalid size type"),
});

export const colorAttributeSchema = z.object({
    name: z.string().min(1, 'Color name is required'),
});

export const materialAttributeSchema = z.object({
    name: z.string().min(1, 'Material name is required'),
});


export type SizeAttributeInput = z.infer<typeof sizeAttributeSchema>;
export type ColorAttributeInput = z.infer<typeof colorAttributeSchema>;
export type MaterialAttributeInput = z.infer<typeof materialAttributeSchema>;