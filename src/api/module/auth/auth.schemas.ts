import { z } from 'zod';

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


export type LoginPayload = z.infer<typeof loginZodSchema>;
export type SignupPayload = z.infer<typeof signupZodSchema>;
export type SetPasswordPayload = z.infer<typeof setPasswordZodSchema>;




// old schemas to be removed after refactoring

const emailPasswordSchema = z.object({
    email: z.email('Invalid email address'),
    password: passwordSchema
}).strict();

export const verifySchema = z.object({
    otp: z.number(),
    email: z.email('Invalid email address'),
    isRememberMe: z.boolean().optional(),
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.email('Invalid email address'),
}).strict();

export const resetPasswordSchema = emailPasswordSchema;

export type VerifyPayload = z.infer<typeof verifySchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
