import { prisma } from "@core/config/prisma";
import { OAuthProvider } from "generated/prisma/enums";


class OAuthRepository {
    public async findOauth(provider: OAuthProvider, providerAccountId: string) {
        const oauth = await prisma.oAuthAccount.findUnique({
            where: { providerAccountId, provider },
        });
        return oauth;
    }

    public async create(userId: string, data: {
        id: string;
        provider: OAuthProvider;
        providerAccountId: string;
        email: string;
    }) {
        const oauth = await prisma.oAuthAccount.create({
            data: {
                userId,
                id: data.id,
                provider: data.provider,
                providerAccountId: data.providerAccountId,
                emailFromProvider: data.email,
            },
        });
        return oauth;
    }
}

export const oauthRepository = new OAuthRepository();