import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@mod/session/session.service", () => ({
    sessionService: {
        createSession: vi.fn(),
    },
}));

vi.mock("@mod/password/password.service", () => ({
    passwordService: {
        addPassword: vi.fn(),
        findPasswordByUserId: vi.fn(),
        isSamePassword: vi.fn(),
        updatePassword: vi.fn(),
        validatePassword: vi.fn(),
    },
}));

vi.mock("@mod/users/user.repository", () => ({
    userRepository: {
        create: vi.fn(),
        findByEmail: vi.fn(),
    },
}));

vi.mock("@mod/password/password.repository", () => ({
    passwordRepository: {
        findByUserId: vi.fn(),
    },
}));

import { passwordRepository } from "@mod/password/password.repository";
import { passwordService } from "@mod/password/password.service";
import { sessionService } from "@mod/session/session.service";
import { userRepository } from "@mod/users/user.repository";
import { authService } from "./auth.service";

const deviceInfo = {
    ip: "127.0.0.1",
    userAgent: "vitest",
};

const tokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
};

describe("authService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("handleLogin", () => {
        it("rejects when user does not exist", async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

            await expect(
                authService.handleLogin({
                    email: "missing@example.com",
                    password: "Password@123",
                }, deviceInfo),
            ).rejects.toThrow("Invalid user credentials.");

            expect(passwordService.findPasswordByUserId).not.toHaveBeenCalled();
            expect(sessionService.createSession).not.toHaveBeenCalled();
        });

        it("creates a session when credentials are valid", async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue({
                id: "user-1",
            } as Awaited<ReturnType<typeof userRepository.findByEmail>>);

            vi.mocked(passwordService.findPasswordByUserId).mockResolvedValue({
                passwordHash: "hashed-password",
            } as Awaited<ReturnType<typeof passwordService.findPasswordByUserId>>);

            vi.mocked(passwordService.validatePassword).mockResolvedValue(undefined);
            vi.mocked(sessionService.createSession).mockResolvedValue(tokens);

            const result = await authService.handleLogin({
                email: "user@example.com",
                password: "Password@123",
            }, deviceInfo);

            expect(userRepository.findByEmail).toHaveBeenCalledWith("user@example.com");
            expect(passwordService.findPasswordByUserId).toHaveBeenCalledWith("user-1");

            expect(passwordService.validatePassword).toHaveBeenCalledWith(
                "Password@123",
                "hashed-password",
            );

            expect(sessionService.createSession).toHaveBeenCalledWith("user-1", deviceInfo);
            expect(result).toEqual(tokens);
        });
    });

    describe("handleSignup", () => {
        it("rejects when user already exists with password credentials", async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue({
                id: "user-1",
            } as Awaited<ReturnType<typeof userRepository.findByEmail>>);
            
            vi.mocked(passwordRepository.findByUserId).mockResolvedValue({
                userId: "user-1",
                passwordHash: "hashed-password",
            } as Awaited<ReturnType<typeof passwordRepository.findByUserId>>);

            await expect(
                authService.handleSignup({
                    name: "Test User",
                    email: "user@example.com",
                    password: "Password@123",
                }, deviceInfo),
            ).rejects.toThrow("User already exists.");

            expect(passwordService.addPassword).not.toHaveBeenCalled();
            expect(sessionService.createSession).not.toHaveBeenCalled();
        });

        it("creates user, password, and session for a new user", async () => {
            vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
            vi.mocked(userRepository.create).mockResolvedValue({
                id: "user-1",
            } as Awaited<ReturnType<typeof userRepository.create>>);
            vi.mocked(passwordService.addPassword).mockResolvedValue(undefined);
            vi.mocked(sessionService.createSession).mockResolvedValue(tokens);

            const result = await authService.handleSignup({
                name: "Test User",
                email: "new@example.com",
                password: "Password@123",
            }, deviceInfo);

            expect(userRepository.create).toHaveBeenCalledWith({
                name: "Test User",
                email: "new@example.com",
                isEmailVerified: false,
            });
            expect(passwordService.addPassword).toHaveBeenCalledWith("user-1", "Password@123");
            expect(sessionService.createSession).toHaveBeenCalledWith("user-1", deviceInfo);
            expect(result).toEqual(tokens);
        });
    });

    describe("handleSetPassword", () => {
        it("rejects when password is already set", async () => {
            vi.mocked(passwordRepository.findByUserId).mockResolvedValue({
                userId: "user-1",
                passwordHash: "hashed-password",
            } as Awaited<ReturnType<typeof passwordRepository.findByUserId>>);

            await expect(
                authService.handleSetPassword("Password@123", "user-1"),
            ).rejects.toThrow("Password is already set.");

            expect(passwordRepository.findByUserId).toHaveBeenCalledWith("user-1");
            expect(passwordService.addPassword).not.toHaveBeenCalled();
        });
    });

    describe("handleChangePassword", () => {
        it("validates current password and updates to the new password", async () => {
            vi.mocked(passwordService.findPasswordByUserId).mockResolvedValue({
                passwordHash: "old-hashed-password",
            } as Awaited<ReturnType<typeof passwordService.findPasswordByUserId>>);
            vi.mocked(passwordService.validatePassword).mockResolvedValue(undefined);
            vi.mocked(passwordService.isSamePassword).mockResolvedValue(undefined);
            vi.mocked(passwordService.updatePassword).mockResolvedValue(undefined);

            await authService.handleChangePassword("user-1", {
                currentPassword: "OldPass@123",
                newPassword: "NewPass@123",
                confirmNewPassword: "NewPass@123",
            });

            expect(passwordService.findPasswordByUserId).toHaveBeenCalledWith("user-1");
            expect(passwordService.validatePassword).toHaveBeenCalledWith(
                "OldPass@123",
                "old-hashed-password",
            );
            expect(passwordService.isSamePassword).toHaveBeenCalledWith(
                "NewPass@123",
                "old-hashed-password",
            );
            expect(passwordService.updatePassword).toHaveBeenCalledWith("user-1", "NewPass@123");
        });
    });
});
