import { prisma } from "@core/config/prisma";
import { UserUpdateInput } from "generated/prisma/models";
import { User } from "generated/prisma/client";
import { UpdateUserPayload } from "./user.validator";
import { userRepository } from "./user.repository";

import { oauthService } from "@mod/oauth/oauth.service";
import { sessionRepository } from "@mod/session/session.repository";


class UserService {
    public async getUserData(user: User) {
        const oauths = await oauthService.getLinkedOAuthAccounts(user.id);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isEmailVerified : user.isEmailVerified,
            profilePictureUrl: user.profilePictureUrl,
            linkedOAuthAccounts: oauths,
        }
    }

    public async updateProfile(userId: string, payload: UpdateUserPayload) {
        await prisma.$transaction(async (tx) => {
            const update: UserUpdateInput = {
                name: payload.name,
            };

            if (payload.email) {
                update.email = payload.email;
                update.isEmailVerified = false;
            }

            if (payload.profilePictureUrl !== undefined) {
                update.profilePictureUrl = payload.profilePictureUrl;
            }

            await userRepository.updateById(userId, update, tx);

            if (payload.email) {
                await sessionRepository.revokeAllByUserId(userId, tx);
            }
        });
    }

}

export const userService = new UserService();