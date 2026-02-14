import { Request } from "express";
import { ClientType } from "./common";
import { User, Admin } from "generated/prisma/client";

declare module "express-serve-static-core" {
    interface Request {
      clientType?: ClientType;
      localsQuery?: any;
      user?: User;
      admin?: Omit<Admin, 'password' | 'passwordVersion' | 'refreshToken'>;
    }
}