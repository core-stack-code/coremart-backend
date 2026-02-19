import z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const mobileSchema = z
    .string()
    .transform(str => str.trim())
    .refine(val => {
        return isValidPhoneNumber(val);
    }, { message: "Invalid mobile number" });