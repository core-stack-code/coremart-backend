import { z } from "zod";

export const createAddressSchema = z.object({
    addressLine1: z
        .string()
        .trim()
        .min(5, "Address line 1 must be at least 5 characters long")
        .max(255, "Address line 1 must be at most 255 characters long"),
    addressLine2: z
        .string()
        .trim()
        .max(255, "Address line 2 must be at most 255 characters long")
        .optional(),
    city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters long")
        .max(100, "City must be at most 100 characters long"),
    state: z
        .string()
        .trim()
        .min(2, "State must be at least 2 characters long")
        .max(100, "State must be at most 100 characters long"),
    postalCode: z
        .string()
        .trim()
        .min(2, "Postal code must be at least 2 characters long")
        .max(20, "Postal code must be at most 20 characters long"),
    country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters long")
        .max(100, "Country must be at most 100 characters long"),
});

export const updateAddressSchema = z.object({
    addressLine1: z
        .string()
        .trim()
        .min(5, "Address line 1 must be at least 5 characters long")
        .max(255, "Address line 1 must be at most 255 characters long")
        .optional(),
    addressLine2: z
        .string()
        .trim()
        .max(255, "Address line 2 must be at most 255 characters long")
        .nullable()
        .optional(),
    city: z
        .string()
        .trim()
        .min(2, "City must be at least 2 characters long")
        .max(100, "City must be at most 100 characters long")
        .optional(),
    state: z
        .string()
        .trim()
        .min(2, "State must be at least 2 characters long")
        .max(100, "State must be at most 100 characters long")
        .optional(),
    postalCode: z
        .string()
        .trim()
        .min(2, "Postal code must be at least 2 characters long")
        .max(20, "Postal code must be at most 20 characters long")
        .optional(),
    country: z
        .string()
        .trim()
        .min(2, "Country must be at least 2 characters long")
        .max(100, "Country must be at most 100 characters long")
        .optional(),
    isDefault: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update"
});

export type CreateAddressPayload = z.infer<typeof createAddressSchema>;
export type UpdateAddressPayload = z.infer<typeof updateAddressSchema>;