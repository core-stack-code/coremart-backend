import { describe, expect, it } from "vitest";
import { mobileSchema } from "./mobile.validator";

describe("mobileSchema", () => {
    it("accepts a valid Indian mobile number and formats it as E.164", () => {
        const result = mobileSchema.safeParse("9876543210");

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data).toBe("+919876543210");
        }
    });

    it("trims whitespace before validating the mobile number", () => {
        const result = mobileSchema.safeParse(" 9876543210 ");

        expect(result.success).toBe(true);

        if (result.success) {
            expect(result.data).toBe("+919876543210");
        }
    });

    it.each([
        "12345",
        "987654321",
        "not-a-phone-number",
    ])("rejects invalid mobile number: %s", (mobile) => {
        const result = mobileSchema.safeParse(mobile);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        message: "Invalid Indian mobile number",
                    }),
                ]),
            );
        }
    });
});
