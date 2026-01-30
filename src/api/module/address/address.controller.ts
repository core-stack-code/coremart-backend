import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { AddressPayload } from "./address.schema";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { addAddressService, getAddressCountPerUser } from "./address.service";
import { AppError, AppResponse } from "../../../core/utils/response";
import { log } from "../../utils/log";

export const addAddressController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const payload: AddressPayload = req.body;
        const userID = new Types.ObjectId(req.auth.userId);

        const addressCount = await getAddressCountPerUser(userID)

        if (addressCount >= 5) {
            throw new AppError(409, "CONFLICT","You have reach the limit to store address");
        }

        const address = await addAddressService(userID, payload);

        AppResponse(res, 200, {
            message: "Address added successfully",
            code: "OK",
            data: address
        })
    }
    catch (error) {
        next(error);
    }
}
