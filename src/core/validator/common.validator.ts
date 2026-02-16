import z from "zod";

export const imageAltSchema = (name: string) => z.
    object({
        url: z.string().trim().min(1, `${name} URL must be provided`),
        altText: z.string().trim().max(255, "Alt text must be at most 255 characters long").optional(),
    });

export type ImageAltPayload = z.infer<ReturnType<typeof imageAltSchema>>;


// pagination
export const pageQuery = z.coerce.number().int().positive().default(1);

export const limitQuery= (defaultLimit = 15, maxLimit = 50) => z
    .coerce.number()
    .int()
    .positive()
    .max(maxLimit, `Limit cannot exceed ${maxLimit}`)
    .default(defaultLimit);