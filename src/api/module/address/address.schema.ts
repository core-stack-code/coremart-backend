import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const phoneSchema = z
    .string()
    .trim()
    .refine((val) => {
        const phone = parsePhoneNumberFromString(val);
        return phone?.isValid() ?? false;
    }, "Invalid phone number");

export const addressSchema = z.object({
    fullName: z.string().trim().min(1, 'Full name is required'),
    phone: phoneSchema,
    addressLine: z.string().trim().min(1, 'Address line is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    postalCode: z.string().trim().min(3, 'Invalid postal code').max(10, "Invalid postal code"),
    country: z.string().trim().min(1, 'Country is required'),
})

export type AddressPayload = z.infer<typeof addressSchema>;