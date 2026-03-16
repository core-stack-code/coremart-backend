import { prisma, PrismaTx } from "@core/config/prisma";
import { passwordRepository } from "./password.repository";
import { comparePassword, generatePasswordHash } from '@core/lib/passsword';
import { AppError } from "@api/utils/response";


class PasswordService {
    async validatePassword(password: string, oldPasswordHash: string): Promise<void> {
        const isValidPassword = await comparePassword(password, oldPasswordHash);

        if (!isValidPassword) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid password.");
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

    public async findPasswordByUserId(userId: string) {
        const passwordCredential = await passwordRepository.findByUserId(userId);
                    
        if (!passwordCredential) {
            throw new AppError(
                401, 
                "UNAUTHORIZED", 
                "You have not set a password. Login using other methods."
            );
        }

        return passwordCredential;
    }

    public async isSamePassword(password: string, oldPasswordHash: string): Promise<void> {
        const isSamePassword = await comparePassword(password, oldPasswordHash);

        if (isSamePassword) {
            throw new AppError(
                400, 
                "BAD_REQUEST", 
                "New password must be different from the old password."
            );
        }
    }
}

export const passwordService = new PasswordService();