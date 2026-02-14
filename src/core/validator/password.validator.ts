import { z } from 'zod';

export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')


export const changePasswordZodSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmNewPassword: passwordSchema,
})
.superRefine((data, ctx) => {
    if (data.currentPassword === data.newPassword) {
        ctx.addIssue({
            path: ["newPassword"],
            code: "custom",
            message: "New password must be different from current password.",
        });
    }

    if (data.newPassword !== data.confirmNewPassword) {
        ctx.addIssue({
            path: ["confirmNewPassword"],
            code: "custom",
            message: "Passwords do not match.",
        });
    }
});

export type ChangePasswordPayload = z.infer<typeof changePasswordZodSchema>;