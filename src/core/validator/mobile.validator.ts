import z from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";

export const mobileSchema = z
    .string()
    .transform(str => str.trim())
    .refine(val => {
        return isValidPhoneNumber(val, 'IN');
    }, { message: "Invalid Indian mobile number" })
    .transform(val => {
        const phoneNumber = parsePhoneNumberFromString(val, 'IN');
        return phoneNumber!.format('E.164');
    });