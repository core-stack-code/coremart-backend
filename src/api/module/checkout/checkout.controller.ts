import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { getCart } from "../cart/cart.service";
import { getAddressById } from "../address/address.service";
import { validateProductStocks } from "../products/products.service";
import { createOrder } from "../order/order.service";

import { assertAuth, assertLoggedIn } from "../../utils/assertAuth";
import { successResponse } from "../../utils/response";
import { CheckoutPayload } from "./checkout.schema";
import { devLooger } from "../../utils/devLogger";
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
        // devLooger.info("address", address);

        const cart = await getCart(userId);
        // devLooger.info("cart", cart);

        const check = await validateProductStocks(cart)
        devLooger.info("stock validation", check);

        const order = await createOrder(userId, cart, address);
        // devLooger.info("order created", order);

        const response = await cashfreeCreateOrder(order);

        successResponse(res, {
            status: 200,
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