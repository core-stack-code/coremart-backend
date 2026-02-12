import { z } from "zod";

const PRODUCT_SORT_BY = {
    PRICE_ASC: "price_asc",
    PRICE_DESC: "price_desc",
    NEWEST: "newest",
    ALPHABETICAL: "alphabetical",
} as const;

type ProductSortBy = typeof PRODUCT_SORT_BY[keyof typeof PRODUCT_SORT_BY];

const productSortByValues : ProductSortBy[] = [
    "alphabetical", "newest", "price_asc", "price_desc"
];


const multiValueString = z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform(val => {
        if (!val) return undefined;

        const values = Array.isArray(val) ? val : [val];

        const cleaned = values
            .map(v => v.trim())
            .filter(v => v.length > 0);

        return cleaned.length ? cleaned : undefined;
    });


export const productListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),

    size: multiValueString,
    color: multiValueString,
    material: multiValueString,
    brand: multiValueString,

    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),

    sortBy: z.enum(productSortByValues).optional(),
    search: z.string().trim().min(1).max(100).optional(),
}).refine(data => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
    }
    return true;
}, {
    message: "minimum price cannot be greater than maximum price",
    path: ["minPrice"],
})

export const productsByCategoryQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    sortBy: z.enum(productSortByValues).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type ProductsByCategoryQuery = z.infer<typeof productsByCategoryQuerySchema>;