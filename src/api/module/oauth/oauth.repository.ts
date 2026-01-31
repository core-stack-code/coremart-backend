import { prisma } from "@core/config/prisma";
import { OAuthProvider } from "generated/prisma/enums";


class OAuthRepository {
    public async findOauth(provider: OAuthProvider, providerAccountId: string) {
        // TODO: make this unique in prisma schema
        // @@unique([provider, providerAccountId])
        // providerAccountId String        @unique
        const oauth = await prisma.oAuthAccount.findFirst({
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