import { prisma, PrismaTx } from "@core/config/prisma";

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

    public async updateByUserId(userId: string, newPassword: string, tx: PrismaTx = prisma) {
        await tx.passwordCredential.update({
            where: { userId },
            data: { 
                passwordHash: newPassword,
                passwordVersion: { increment: 1 },
            },
        });
    }
}

export const passwordRepository = new PasswordRepository();