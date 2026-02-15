import { z } from "zod";

export const updateUserSchema = z.object({
    email: z.email("Invalid email address").optional(),
    name: z.string().trim().min(2, "Name must be at least 2 characters long").optional(),
    profilePictureUrl: z.string().trim().nullable().optional(),
});

export type UpdateUserPayload = z.infer<typeof updateUserSchema>;