import express from "express";
import { oauthController } from "./oauth.controller";
import { asyncWrapper } from "@core/utils/asyncWrapper";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const oauthRouter = express.Router();

oauthRouter.get(
    '/google',
    oauthController.googleRedirect
);

oauthRouter.get(
    '/google/callback',
    asyncWrapper(oauthController.googleCallback)
);

oauthRouter.get(
    '/github',
    oauthController.githubRedirect
);

oauthRouter.get(
    '/github/callback',
    asyncWrapper(oauthController.githubCallback)
);

oauthRouter.get(
    '/link-google',
    authMiddleware({ requireEmailVerified: false }),
    oauthController.linkGoogleRedirect
);

oauthRouter.get(
    '/link-google/callback',
    asyncWrapper(oauthController.linkGoogleCallback)
);

oauthRouter.get(
    '/link-github',
    authMiddleware({ requireEmailVerified: false }),
    oauthController.linkGithubRedirect
);

oauthRouter.get(
    '/link-github/callback',
    asyncWrapper(oauthController.linkGithubCallback)
);

export default oauthRouter;