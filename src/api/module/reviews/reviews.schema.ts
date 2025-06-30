import { z } from 'zod';

export const addReviewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    title: z.string().optional(),
    description: z.string().optional(),
});


export const updateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    title: z.string().optional(),
    description: z.string().optional(),
}).refine((data) => {
    return Object.keys(data).length > 0
}, {
    message: 'At least one field must be provided to update.',
});


export type AddReviewType = z.infer<typeof addReviewSchema>;
export type UpdateReviewType = z.infer<typeof updateReviewSchema>;
