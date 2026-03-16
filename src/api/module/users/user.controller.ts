import { Request, Response } from "express";
import { UpdateUserPayload } from "./user.validator";
import { userService } from "./user.service";

import { clearAuthCookies } from "@core/utils/cookies.helper";
import { AppResponse } from "@api/utils/response";


class UserController {
    public async getProfile(req: Request, res: Response) {
        const user = await userService.getUserData(req.user!);

        AppResponse(res, 200, {
            code: "OK",
            message: "User profile retrieved successfully",
            data: user,
        });
    }

    public async updateProfile(req: Request, res: Response) {
        const user = req.user!;
        const payload = req.body as UpdateUserPayload;

        await userService.updateProfile(user.id, payload);

        if (payload.email) {
            clearAuthCookies(res);
        }

        AppResponse(res, 200, {
            code: "OK",
            message: "User profile updated successfully",
        });
    }
}

export const userController = new UserController();