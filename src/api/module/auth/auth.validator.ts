import { z } from 'zod';
import { OtpSessionType } from 'generated/prisma/enums';
import { passwordSchema } from '@core/validator/password.validator';

const otpSessionEnum: OtpSessionType[] = [
    "EMAIL_VERIFICATION", "PASSWORD_RESET"
]

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


export type LoginPayload = z.infer<typeof loginZodSchema>;
export type SignupPayload = z.infer<typeof signupZodSchema>;
export type SetPasswordPayload = z.infer<typeof setPasswordZodSchema>;
export type GenerateOtpPayload = z.infer<typeof generateOtpZodSchema>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpZodSchema>;
export type ResendOtpPayload = z.infer<typeof resendOtpZodSchema>;