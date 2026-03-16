import express from "express";
import { oauthController } from "./oauth.controller";
import { asyncWrapper } from "@api/utils/asyncWrapper";
import { authMiddleware } from "@api/middlewares/auth.middleware";

const oauthRouter = express.Router();

oauthRouter.get(
    '/google',
    asyncWrapper(oauthController.googleRedirect)
);

oauthRouter.get(
    '/google/callback',
    asyncWrapper(oauthController.googleCallback)
);

oauthRouter.get(
    '/github',
    asyncWrapper(oauthController.githubRedirect)
);

oauthRouter.get(
    '/github/callback',
    asyncWrapper(oauthController.githubCallback)
);

oauthRouter.get(
    '/link-google',
    authMiddleware({ requireEmailVerified: false }),
    asyncWrapper(oauthController.linkGoogleRedirect)
);

oauthRouter.get(
    '/link-google/callback',
    asyncWrapper(oauthController.linkGoogleCallback)
);

oauthRouter.get(
    '/link-github',
    authMiddleware({ requireEmailVerified: false }),
    asyncWrapper(oauthController.linkGithubRedirect)
);

oauthRouter.get(
    '/link-github/callback',
    asyncWrapper(oauthController.linkGithubCallback)
);

export default oauthRouter;