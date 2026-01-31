import { Request } from "express";

type GuestAuth = {
  isGuest: true;
};

type LoggedInAuth = {
  userId: string;
  email: string;
  isGuest: false;
};

export type AuthType = GuestAuth | LoggedInAuth;

declare module "express-serve-static-core" {
    interface Request {
        clinetType?: string,
        auth?: AuthType
    }
}