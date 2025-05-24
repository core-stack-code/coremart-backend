import { z } from 'zod';

const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')

const emailPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema
}).strict();



export const signupSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
}).strict();
  
export const loginSchema = emailPasswordSchema.extend({
    isRememberMe: z.boolean().optional(),
}).strict();

export const verifySchema = z.object({
    otp: z.number(),
    email: z.string().email('Invalid email address'),
    isRememberMe: z.boolean().optional(),
}).strict();

export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
}).strict();

export const resetPasswordSchema = emailPasswordSchema;

export type SignupPayload = z.infer<typeof signupSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
export type VerifyPayload = z.infer<typeof verifySchema>;
export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
