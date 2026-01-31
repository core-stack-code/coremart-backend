import { prisma } from "@core/config/prisma";
import { DeviceType } from "generated/prisma/enums";


class SessionRepository {
    public async create(data: {
        id: string;
        userId: string;
        expiresAt: Date;
        refreshTokenHash: string;
        deviceType: DeviceType;
        ip: string;
        deviceName?: string;
    }) {
        await prisma.session.create({
            data : {
                id: data.id,
                expiresAt: data.expiresAt,
                refreshTokenHash: data.refreshTokenHash,
                userId: data.userId,
                deviceType: data.deviceType,
                ipAddress: data.ip,
                revokedAt: null,
                deviceName: data.deviceName || null,
            }
        });
    }


    public async countActive(userId: string) {
        return await prisma.session.count({
            where: { 
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            },
        });
    }


    public async revokeOldest(userId: string) {
        await prisma.$transaction(async (tx) => {
            const oldestSession = await tx.session.findFirst({
                where: {
                    userId,
                    revokedAt: null,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            if (oldestSession) {
                await tx.session.update({
                    where: { id: oldestSession.id },
                    data: { revokedAt: new Date() },
                });
            }
        });
    }
}

export const sessionRepository = new SessionRepository();