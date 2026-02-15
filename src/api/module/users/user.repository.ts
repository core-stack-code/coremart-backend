import { prisma, PrismaTx } from "@/core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { UserUpdateInput } from "generated/prisma/models";


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
        name?: string;
        email: string;
        isEmailVerified: boolean;
        profilePictureUrl?: string | null;
    }) {
        const user = await prisma.user.create({
            data : {
                id: getUuid(),
                name: data.name || null,
                email: data.email,
                isEmailVerified: data.isEmailVerified,
                profilePictureUrl: data.profilePictureUrl || null,
            }
        });
        return user;
    }

    public async updateById(id: string, data: UserUpdateInput, tx: PrismaTx = prisma) {
        await tx.user.update({
            where: { id },
            data,
        });
    }
}

export const userRepository = new UserRepository();