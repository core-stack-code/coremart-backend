import z from "zod";

export const createReviewSchema = z.object({
    productId: z.string().trim().min(1, "Invalid product ID"),
    rating: z.number().int().min(1).max(5),
    comment: z
        .string()
        .min(5, "Comment must be at least 5 characters long")
        .max(500, "Comment must be at most 500 characters long")
        .optional(),
});

export const updateReviewSchema = z.object({
    rating: z.number().int().min(1).max(5),
    comment: z
        .string()
        .min(5, "Comment must be at least 5 characters long")
        .max(500, "Comment must be at most 500 characters long")
        .optional(),
});

export type CreateReviewPayload = z.infer<typeof createReviewSchema>;
export type UpdateReviewPayload = z.infer<typeof updateReviewSchema>;