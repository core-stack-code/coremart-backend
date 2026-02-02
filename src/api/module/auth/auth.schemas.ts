import { z } from 'zod';
import { OtpSessionType } from 'generated/prisma/enums';

const otpSessionEnum: OtpSessionType[] = [
    "EMAIL_VERIFICATION", "PASSWORD_RESET"
]

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

export const loginZodSchema = z.object({
    email: z.email('Invalid email address'),
    password: passwordSchema
})

export const signupZodSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.email('Invalid email address'),
    password: passwordSchema,
})

export const setPasswordZodSchema = z.object({
    password: passwordSchema,
});

export const generateOtpZodSchema = z.object({
    sessionType: z.enum(otpSessionEnum),
});

export const verifyOtpZodSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 characters long'),
    sessionType: z.enum(otpSessionEnum),
    newPassword: passwordSchema.optional(),
});

export const resendOtpZodSchema = z.object({
    sessionType: z.enum(otpSessionEnum),
});

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

export type LoginPayload = z.infer<typeof loginZodSchema>;
export type SignupPayload = z.infer<typeof signupZodSchema>;
export type SetPasswordPayload = z.infer<typeof setPasswordZodSchema>;
export type GenerateOtpPayload = z.infer<typeof generateOtpZodSchema>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpZodSchema>;
export type ResendOtpPayload = z.infer<typeof resendOtpZodSchema>;
export type ChangePasswordPayload = z.infer<typeof changePasswordZodSchema>;