import { prisma, PrismaTx } from "@core/config/prisma";
import { passwordRepository } from "./password.repository";
import { comparePassword, generatePasswordHash } from '@core/lib/passsword';
import { AppError } from "@core/utils/response";


class PasswordService {
    async validatePassword(userId: string, password: string): Promise<void> {
        const passwordCredential = await passwordRepository.findByUserId(userId);

        if (!passwordCredential) {
            throw new AppError(
                401, 
                "UNAUTHORIZED", 
                "You have not set a password. Login using other methods."
            );
        }

        const isValidPassword = await comparePassword(password, passwordCredential.passwordHash);

        if (!isValidPassword) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid password.");
        }
    }

    public async validateSamePassword(userId: string, password: string): Promise<void> {
        const passwordCredential = await passwordRepository.findByUserId(userId);

        if (!passwordCredential) {
            throw new AppError(
                401, 
                "UNAUTHORIZED", 
                "You have not set a password. Login using other methods."
            );
        }

        const isSamePassword = await comparePassword(password, passwordCredential.passwordHash);

        if (isSamePassword) {
            throw new AppError(400, "BAD_REQUEST", "New password must be different from the old password.");
        }
    }

    public async addPassword(userId: string, password: string): Promise<void> {
        const passwordHash = await generatePasswordHash(password);
        
        await passwordRepository.create({
            userId,
            passwordHash,
        });
    }

    public async updatePassword(userId: string, newPassword: string, tx: PrismaTx = prisma): Promise<void> {
        const newPasswordHash = await generatePasswordHash(newPassword);

        await passwordRepository.updateByUserId(
            userId, newPasswordHash, tx
        );
    }
}

export const passwordService = new PasswordService();