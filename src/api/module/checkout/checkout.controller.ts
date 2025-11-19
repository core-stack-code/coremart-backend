import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { devLooger } from "../../utils/devLogger";
import { successResponse } from "../../utils/response";
import { getCart } from "../cart/cart.service";
import { CheckoutPayload } from "./checkout.schema";
import { getAddressById } from "../address/address.service";
import { validateProductStocks } from "../products/products.service";


export const checkoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        assertAuth(req.auth);
        assertLoggedIn(req.auth);
        
        const payload = req.body as CheckoutPayload;
        const addressId = new Types.ObjectId(payload.addressId);
        const userId = new Types.ObjectId(req.auth.userId)

        const address = await getAddressById(addressId);
        devLooger.info("address", address);

        const cart = await getCart(userId);
        devLooger.info("cart", cart);

        const check = await validateProductStocks(cart)
        devLooger.info("stock validation", check);

        successResponse(res, {
            status: 200,
            message: 'Checkout successful.',
            data: {
                cart,
                address
            }
        });
    }
    catch (error) {
        next(error);
    }
}