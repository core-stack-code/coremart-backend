import { AppError } from "@core/utils/response";
import { passwordRepository } from "./password.repository";
import { comparePassword, generatePasswordHash } from '@core/lib/passsword';


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

    public async addPasswrod(userId: string, password: string): Promise<void> {
        const passwordHash = await generatePasswordHash(password);
        
        await passwordRepository.create({
            userId,
            passwordHash,
        });
    }
}

export const passwordService = new PasswordService();