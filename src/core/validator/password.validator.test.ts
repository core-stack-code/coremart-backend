import { describe, expect, it } from "vitest";
import { changePasswordZodSchema, passwordSchema } from "./password.validator";

describe("passwordSchema", () => {
    it("accepts a strong password", () => {
        const result = passwordSchema.safeParse("Strong@123");

        expect(result.success).toBe(true);
    });

    it.each([
        ["Short@1", "Password must be at least 8 characters"],
        ["PASSWORD@123", "Password must contain at least one lowercase letter"],
        ["password@123", "Password must contain at least one uppercase letter"],
        ["Password@", "Password must contain at least one number"],
        ["Password123", "Password must contain at least one special character"],
    ])("rejects invalid password: %s", (password, expectedMessage) => {
        const result = passwordSchema.safeParse(password);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ message: expectedMessage }),
                ]),
            );
        }
    });
});

describe("changePasswordZodSchema", () => {
    it("accepts a valid password change payload", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "OldPass@123",
            newPassword: "NewPass@123",
            confirmNewPassword: "NewPass@123",
        });

        expect(result.success).toBe(true);
    });

    it("rejects when new password is same as current password", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "SamePass@123",
            newPassword: "SamePass@123",
            confirmNewPassword: "SamePass@123",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ["newPassword"],
                        message: "New password must be different from current password.",
                    }),
                ]),
            );
        }
    });

    it("rejects when confirm password does not match new password", () => {
        const result = changePasswordZodSchema.safeParse({
            currentPassword: "OldPass@123",
            newPassword: "NewPass@123",
            confirmNewPassword: "OtherPass@123",
        });

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error.issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        path: ["confirmNewPassword"],
                        message: "Passwords do not match.",
                    }),
                ]),
            );
        }
    });
});
