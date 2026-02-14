import z from "zod";
import { passwordSchema } from "@core/validator/password.validator";

export const adminLoginSchema = z.object({
    email: z.email("Invalid email address"),
    password: passwordSchema,
});

export const adminSchema = z.object({
    email: z.email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    password: passwordSchema,
});

export type AdminLoginPayload = z.infer<typeof adminLoginSchema>;
export type AdminPayload = z.infer<typeof adminSchema>;