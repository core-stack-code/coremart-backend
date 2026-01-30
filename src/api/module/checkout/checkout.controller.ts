import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { getCart } from "../cart/cart.service";
import { getAddressById } from "../address/address.service";
import { validateProductStocks } from "../products/products.service";
import { createOrder } from "../order/order.service";

import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { AppResponse } from "../../../core/utils/response";
import { CheckoutPayload } from "./checkout.schema";
import { log } from "../../utils/log";
import { cashfreeCreateOrder } from "../payment/payment.service";


export const checkoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // assertAuth(req.auth);
        // assertLoggedIn(req.auth);

        
        const payload = req.body as CheckoutPayload;
        const addressId = new Types.ObjectId(payload.addressId);
        // const userId = new Types.ObjectId(req.auth.userId)
        const userId = new Types.ObjectId("6831d8c6b6181a5ec08620dc");

        const address = await getAddressById(addressId);
        // log.info("address", address);

        const cart = await getCart(userId);
        // log.info("cart", cart);

        const check = await validateProductStocks(cart)
        log.info("stock validation", check);

        const order = await createOrder(userId, cart, address);
        // log.info("order created", order);

        const response = await cashfreeCreateOrder(order);

        AppResponse(res, 200, {
            code: "OK",
            message: 'Checkout successful.',
            data: {
                response,
            }
        });
    }
    catch (error) {
        next(error);
    }
}