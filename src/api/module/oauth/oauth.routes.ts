import express from "express";
import { oauthController } from "./oauth.controller";
import { asyncWrapper } from "@core/utils/asyncWrapper";

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

export default oauthRouter;