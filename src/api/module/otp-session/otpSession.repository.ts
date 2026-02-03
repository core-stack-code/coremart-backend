import { prisma, PrismaTx } from "@core/config/prisma";
import { OtpSession } from "generated/prisma/client";
import { OtpSessionType } from "generated/prisma/enums";
import { OtpSessionUpdateInput } from "generated/prisma/models";


class OtpSessionRepository {
    invalidateActiveByUserAndType = async (
        userId: string,
        sessionType: OtpSessionType,
        now: Date,
        tx: PrismaTx = prisma
    ): Promise<void> => {
        const prismaClient = tx ?? prisma;

        await prismaClient.otpSession.updateMany({
            where: {
                userId,
                sessionType,
                isUsed: false,
                otpExpiresAt: {
                    gt: now,
                },
            },
            data: {
                isUsed: true,
            },
        });
    };


    public async create(data: {
        id: string;
        userId: string;
        sessionType: OtpSessionType;
        otpHash: string;
        expiresAt: Date;
        lastResendAt?: Date;
    }, tx: PrismaTx = prisma
    ): Promise<void> {
        await tx.otpSession.create({
            data: {
                id: data.id,
                userId: data.userId,
                sessionType: data.sessionType,
                otpHash: data.otpHash,
                otpExpiresAt: data.expiresAt,
                lastResendAt: data.lastResendAt || new Date(),           
            },
            select: null,
        });
    }

    public async updateById(id: string, data: OtpSessionUpdateInput, tx: PrismaTx = prisma) {
        await tx.otpSession.update({
            where: { id },
            data,
        });
    }

    public async findActiveByUserAndType(
        userId: string,
        sessionType: OtpSessionType
    ): Promise<OtpSession | null> {
        return await prisma.otpSession.findFirst({
            where: {
                userId,
                sessionType,
                isUsed: false,
            },
            orderBy: {
                createdAt: "desc",
            }
        });
    }

    public async countRecentByUserAndType(
        userId: string,
        sessionType: OtpSessionType,
        since: Date,
        tx: PrismaTx = prisma
    ): Promise<number> {

        return await tx.otpSession.count({
            where: {
                userId,
                sessionType,
                lastResendAt: {
                    gte: since,
                },
            },
        });
    }
}

export const otpSessionRepository = new OtpSessionRepository();