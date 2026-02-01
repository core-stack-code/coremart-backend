import { prisma } from "@core/config/prisma";

class PasswordRepository {
    public async findByUserId(userId: string) {
        return await prisma.passwordCredential.findUnique({
            where: { userId },
        });
    }

    public async create(data: {
        userId: string;
        passwordHash: string;
    }) {
        return await prisma.passwordCredential.create({
            data: {
                userId: data.userId,
                passwordHash: data.passwordHash,
            }
        });
    }
}

export const passwordRepository = new PasswordRepository();