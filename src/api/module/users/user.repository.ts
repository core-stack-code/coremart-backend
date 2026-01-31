import { prisma } from "@/core/config/prisma";


class UserRepository {
    public async findByEmail(email: string) {
        const user = await prisma.user.findUnique({
            where: { email },
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
}

export const userRepository = new UserRepository();