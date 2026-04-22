import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']),
  PORT: z.coerce.number().default(4000),
  CLIENT_DOMAIN_URL: z.url(),
  ADMIN_DOMAIN_URL: z.url(),
  DATABASE_URL: z.string().trim().min(1),
  REDIS_URL: z.string().trim().min(1),
  
  DOMAIN: z.string().trim().min(1),
  EMAIL_DOMAIN: z.string().trim().min(1),

  JWT_ACCESS_SECRET: z.string().trim().min(1),
  JWT_REFRESH_SECRET: z.string().trim().min(1),
  ADMIN_ACCESS_SECRET: z.string().trim().min(1),
  ADMIN_REFRESH_SECRET: z.string().trim().min(1),
  SESSIONS_SECRET: z.string().trim().min(1),

  RESEND_API_KEY: z.string().trim().min(1),

  CASHFREE_API_KEY: z.string().trim().min(1),
  CASHFREE_API_SECRET: z.string().trim().min(1),
  CASHFREE_API_VERSION: z.string().trim().min(1),

  GOOGLE_CLIENT_ID: z.string().trim().min(1),
  GOOGLE_CLIENT_SECRET: z.string().trim().min(1),
  GOOGLE_REDIRECT_URI: z.url(),

  GITHUB_CLIENT_ID: z.string().trim().min(1),
  GITHUB_CLIENT_SECRET: z.string().trim().min(1),
  GITHUB_REDIRECT_URI: z.url(),

  CLOUDINARY_CLOUD_NAME: z.string().trim().min(1),
  CLOUDINARY_API_KEY: z.string().trim().min(1),
  CLOUDINARY_API_SECRET: z.string().trim().min(1),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', JSON.stringify(parsedEnv.error, null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;