import z from "zod";
import { passwordSchema } from "@core/validator/password.validator";

export const adminLoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: passwordSchema,
});

export const updateAdminProfileSchema = z.object({
    name: z.string().min(1, "Name is required"),
    imageUrl: z.string().trim().min(1, "Image URL is required").optional(),
});

export const adminSchema = z.object({
    email: z.email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    password: passwordSchema,
});

export type AdminLoginPayload = z.infer<typeof adminLoginSchema>;
export type AdminPayload = z.infer<typeof adminSchema>;
export type UpdateAdminProfilePayload = z.infer<typeof updateAdminProfileSchema>;