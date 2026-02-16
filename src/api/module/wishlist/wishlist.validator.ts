import { limitQuery, pageQuery } from "@core/validator/common.validator";
import { z } from "zod";

export const wishlistSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Name must be at least 2 characters long")
		.max(100, "Name must be at most 100 characters long"),
});

export const productsOfWishlistQuerySchema = z.object({
    page: pageQuery,
    limit: limitQuery(15, 30),
});


export type WishlistPayload = z.infer<typeof wishlistSchema>;
export type ProductsOfWishlistQuery = z.infer<typeof productsOfWishlistQuerySchema>;
