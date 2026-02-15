import { prisma } from "@core/config/prisma";
import { OAuthAccount } from "generated/prisma/client";
import { OAuthProvider } from "generated/prisma/enums";


class OAuthRepository {
    public async findOauth(
        provider: OAuthProvider,
        providerAccountId: string
    ): Promise<Pick<OAuthAccount, 'id' | 'userId'> | null> {
        const oauth = await prisma.oAuthAccount.findUnique({
            where: { 
                providerAccountId, 
                provider
            },
            select: { id: true, userId: true  },
        });
        return oauth;
    }

    public async findByUserAndProvider(
        userId: string,
        provider: OAuthProvider
    ): Promise<Pick<OAuthAccount, 'id'> | null> {
        const oauth = await prisma.oAuthAccount.findFirst({
            where: {
                userId,
                provider,
            },
            select: { id: true }, 
        });
        return oauth;
    }

    public async create(userId: string, data: {
        id: string;
        provider: OAuthProvider;
        providerAccountId: string;
        email: string;
    }) {
        await prisma.oAuthAccount.create({
            data: {
                userId,
                id: data.id,
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                emailFromProvider: data.email,
            },
            select: null,
        });
    }

    public async getOauthByUserId(userId: string) {
        return await prisma.oAuthAccount.findMany({
            where: { userId },
            select: {
                provider: true,
                emailFromProvider: true,
            }
        })
    }
}

export const oauthRepository = new OAuthRepository();