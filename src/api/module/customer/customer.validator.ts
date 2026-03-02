import { z } from "zod";
import { limitQuery, pageQuery } from "@core/validator/common.validator";


export const customersListSchema = z.object({
    page: pageQuery,
    limit: limitQuery(),
});

export type CustomersListQuery = z.infer<typeof customersListSchema>;