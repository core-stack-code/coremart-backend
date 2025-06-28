import { z } from 'zod';
import {
  colorsEnum,
  sizesEnum,
  dressTypeEnum,
  sortByValues,
  categoryEnum,
} from './products.contant';


const zStringOrArray = z.union([z.string(), z.array(z.string())]).transform((val) =>
  typeof val === 'string' ? [val] : val
);


export const productListQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),

    // Sort
    sortBy: z.enum(sortByValues).optional(),

    // by tag
    // tags: z.enum(tagsEnum).optional(),

    // Multi-value filters
    brand: zStringOrArray.optional(),
    color: zStringOrArray
        .transform((arr) => arr.filter((val) => colorsEnum.includes(val as any)))
        .optional(),
    size: zStringOrArray
        .transform((arr) => arr.filter((val) => sizesEnum.includes(val as any)))
        .optional(),
    category: zStringOrArray
        .transform((arr) => arr.filter((val) => categoryEnum.includes(val as any)))
        .optional(),
    type: zStringOrArray
        .transform((arr) => arr.filter((val) => dressTypeEnum.includes(val as any)))
        .optional(),

    // Price range filter
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;