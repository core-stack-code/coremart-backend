import { prisma } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";


class AdminRepository {
    public async count() {
        return await prisma.admin.count();
    }

    public async createAdmin(data: {
        email: string;
        name: string;
        password: string;
    }) {
        return await prisma.admin.create({
            data: {
                id: getUuid(),
                email: data.email,
                name: data.name,
                password: data.password,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            }
        })
    }

    public async findByEmail(email: string) {
        return await prisma.admin.findUnique({
            where: { email }
        });
    }

    public async findById(id: string) {
        return await prisma.admin.findUnique({
            where: { id },
        });
    }

    public async updateRefreshToken(adminId: string, refreshToken: string | null) {
        return await prisma.admin.update({
            where: { id: adminId },
            data: { refreshToken },
        });
    }

    public async updatePassword(adminId: string, passwordHash: string) {
        return await prisma.admin.update({
            where: { id: adminId },
            data: { 
                password: passwordHash,
                passwordVersion: { increment: 1 }
            },
        });
    }
}

export const adminRepository = new AdminRepository();