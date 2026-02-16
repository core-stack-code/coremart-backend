import { z } from "zod";
import { ProductStatus } from "generated/prisma/enums";
import { imageAltSchema, limitQuery, pageQuery } from "@core/validator/common.validator";

const productStatusEnum: ProductStatus[] = [
    "ACTIVE", "ARCHIVED", "DRAFT"
] as const;


export const createProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must be at most 100 characters long"),
    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters long")
        .max(2000, "Description must be at most 2000 characters long"),
    thumbnailUrl: 
        imageAltSchema("Thumbnail")
        .nullable()
        .optional(),
    imageGalary: z
        .array(imageAltSchema("Product gallery image"))
        .optional(),
});


export const updateProductSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters long")
        .max(100, "Name must be at most 100 characters long")
        .optional(),
    description: z
        .string()
        .trim()
        .min(10, "Description must be at least 10 characters long")
        .max(2000, "Description must be at most 2000 characters long")
        .optional(),
    status: z
        .enum(productStatusEnum, "Invalid product status")
        .optional(),
    thumbnailUrl: 
        imageAltSchema("Thumbnail")
        .nullable()
        .optional(),
    imageGalary: z
        .array(imageAltSchema("Product gallery image"))
        .optional(),
    
}).refine(data => Object.keys(data).length > 0, {
    message: "At least name, description, or status must be provided for update"
});


export const productListQuerySchema = z.object({
    page: pageQuery,
    limit: limitQuery(),
});


export type CreateProductPayload = z.infer<typeof createProductSchema>;
export type UpdateProductPayload = z.infer<typeof updateProductSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;