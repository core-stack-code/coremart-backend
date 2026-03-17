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
        isDemo?: boolean;
    }) {
        return await prisma.admin.create({
            data: {
                id: getUuid(),
                email: data.email,
                name: data.name,
                password: data.password,
                isDemo: data.isDemo ?? false,
            },
            select: {
                id: true,
                email: true,
                name: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
                isDemo: true,
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

    public async updateProfile(adminId: string, payload: {
        name?: string;
        imageUrl?: string
    }) {
        return await prisma.admin.update({
            where: { id: adminId },
            data: payload,
        });
    }
}

export const adminRepository = new AdminRepository();