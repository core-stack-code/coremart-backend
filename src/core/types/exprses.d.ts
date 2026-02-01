import { Request } from "express";
import { ClientType } from "./common";
import { User } from "generated/prisma/client";

declare module "express-serve-static-core" {
    interface Request {
      clinetType?: ClientType;
      localsQuery?: any;
      user?: User;
    }
}