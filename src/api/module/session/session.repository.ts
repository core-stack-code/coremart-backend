import { prisma } from "@core/config/prisma";
import { Prisma } from "generated/prisma/client";
import { DeviceType } from "generated/prisma/enums";

type PrismaTx = Prisma.TransactionClient;

class SessionRepository {
    public async countActive(userId: string, tx: PrismaTx = prisma) {
        return await tx.session.count({
            where: { 
                userId,
                revokedAt: null,
                expiresAt: { gt: new Date() }
            },
        });
    }


    public async create(
        data: {
            id: string;
            userId: string;
            expiresAt: Date;
            refreshToken: string;
            deviceType: DeviceType;
            ip: string;
            deviceName?: string;
        },
        tx: PrismaTx = prisma
    ) {
        await tx.session.create({
            data : {
                id: data.id,
                expiresAt: data.expiresAt,
                refreshToken: data.refreshToken,
                userId: data.userId,
                deviceType: data.deviceType,
                ipAddress: data.ip,
                revokedAt: null,
                deviceName: data.deviceName || null,
            }
        });
    }


    public async revokeOldest(userId: string, tx: PrismaTx = prisma) {
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
    }

    public async findByRefreshToken(refreshToken: string, tx: PrismaTx = prisma) {
        return await tx.session.findFirst({
            where: {
                refreshToken,
                revokedAt: null,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });
    }

    public async revokeById(sessionId: string, tx: PrismaTx = prisma) {
        await tx.session.update({
            where: { id: sessionId },
            data: { revokedAt: new Date() },
        });
    }

    public async revokeAllByUserId(userId: string, tx: PrismaTx = prisma) {
        await tx.session.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
    }
}

export const sessionRepository = new SessionRepository();