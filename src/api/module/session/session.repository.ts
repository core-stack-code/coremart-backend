import { prisma, PrismaTx } from "@core/config/prisma";
import { DeviceType } from "generated/prisma/enums";


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
            },
            select: null,
        });
    }


    public async revokeOverflow(
        userId: string,
        keep: number,
        tx: PrismaTx = prisma
    ) {
        const sessionsToRevoke = await tx.session.findMany({
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
            skip: keep,
            select: { id: true },
        });

        if (sessionsToRevoke.length === 0) return;

        await tx.session.updateMany({
            where: {
                id: { in: sessionsToRevoke.map(s => s.id) },
            },
            data: {
                revokedAt: new Date(),
            },
        });
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