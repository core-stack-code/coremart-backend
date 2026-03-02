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

    // admin queries
    public async findMany(skip: number, take: number) {
        const users = await prisma.user.findMany({
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                isEmailVerified: true,
                profilePictureUrl: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        orders: true,
                    }
                }
            }
        });
        return users;
    }

    public async count() {
        return await prisma.user.count();
    }

    public async userDetails(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                isEmailVerified: true,
                profilePictureUrl: true,
                createdAt: true,
                updatedAt: true,
                orders: {
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        createdAt: true,
                        confirmedAt: true,
                        _count: {
                            select: {
                                orderItems: true
                            }
                        }
                    }
                },
                userAddresses: {
                    select: {
                        id: true,
                        addressLine1: true,
                        addressLine2: true,
                        city: true,
                        state: true,
                        postalCode: true,
                        country: true,
                    }
                }
            }
        });
        return user;
    }
}

export const userRepository = new UserRepository();