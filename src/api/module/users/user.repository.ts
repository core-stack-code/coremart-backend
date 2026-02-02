import { prisma, PrismaTx } from "@/core/config/prisma";
import { User } from "generated/prisma/client";


class UserRepository {
    public async findByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    public async findById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
        });
        return user;
    }

    public async create(data: {
        id: string;
        name?: string;
        email: string;
        isEmailVerified: boolean;
    }) {
        const user = await prisma.user.create({
            data : {
                id: data.id,
                name: data.name || null,
                email: data.email,
                isEmailVerified: data.isEmailVerified,
            }
        });
        return user;
    }

    public async updateById(id: string, data: Partial<User>, tx: PrismaTx = prisma) {
        await tx.user.update({
            where: { id },
            data,
        });
    }
}

export const userRepository = new UserRepository();