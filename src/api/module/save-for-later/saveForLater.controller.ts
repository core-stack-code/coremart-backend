import { NextFunction, Request, Response } from "express";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { Types } from "mongoose";
import { AppResponse } from "../../../core/utils/response";
import { getSaveForLaterList, toggleSaveForLater } from "./saveForLater.service";

export const toggleSaveForLaterController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const productId =  new Types.ObjectId(req.body.productId);
        const userId = new Types.ObjectId(req.auth.userId);

        await toggleSaveForLater(productId, userId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Save for later updated successfully.',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
}

export const getSaveForLaterListController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const userId = new Types.ObjectId(req.auth.userId);
        const saveForLater = await getSaveForLaterList(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Save For Later list fetched successfully.',
            data: {
                saveForLater
            }
        });
    } catch (error) {
        next(error);
    }
}