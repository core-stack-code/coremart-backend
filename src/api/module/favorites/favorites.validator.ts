import { z } from "zod";
import { limitQuery, pageQuery } from "@core/validator/common.validator";

export const favoriteListQuerySchema = z.object({
    page: pageQuery,
    limit: limitQuery(12, 50),
});

export type FavoriteListQuery = z.infer<typeof favoriteListQuerySchema>;