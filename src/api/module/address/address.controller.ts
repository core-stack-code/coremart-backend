import { Types } from "mongoose";
import { NextFunction, Request, Response } from "express";
import { AddressPayload } from "./address.schema";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { addAddressService, getAddressCountPerUser } from "./address.service";
import { CustomError, successResponse } from "../../utils/response";
import { devLooger } from "../../utils/devLogger";

export const addAddressController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);

        const payload: AddressPayload = req.body;
        const userID = new Types.ObjectId(req.auth.userId);

        const addressCount = await getAddressCountPerUser(userID)

        if (addressCount >= 5) {
            throw new CustomError("You have reach the limit to store address", 409);
        }

        const address = await addAddressService(userID, payload);

        successResponse(res, {
            message: "Address added successfully",
            status: 200,
            data: address
        })
    }
    catch (error) {
        next(error);
    }
}
