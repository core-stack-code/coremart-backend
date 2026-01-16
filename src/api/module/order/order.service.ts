import { Types } from "mongoose";
import Order, { OrderLean } from "./order.model";

import { CartResponse } from "../cart/cart.types";
import { AddressLeanSelected } from "../address/address.model";
import { CutomerDetials, ProductItem, ShippingAddress } from "./order.types";


export const createOrder = async (
    userId: Types.ObjectId, 
    cart: CartResponse, 
    address: AddressLeanSelected
): Promise<OrderLean> => {
    const orderItems: ProductItem[] = cart.items.map(item => ({
        productId: item.product._id.toString(), 
        name: item.product.name,
        slug: item.product.slug,
        category: item.product.category,
        price: item.product.price,
        image: item.product.image,
    }));

    const shippingAddress: ShippingAddress = {
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
    } 

    const cutomerDetails: CutomerDetials = {
        fullName: address.fullName,
        phone: address.phone,
    }

    const order = new Order({
        userId,
        orderItems,
        shippingAddress,
        cutomerDetails,
        itemTotal: cart.totalPrice,
        order_amount: cart.totalPrice,
        order_currency: "INR",
    })

    const newOrder = await order.save();
    return newOrder.toObject() as OrderLean; // when need lean object
    // return newOrder; // when need document object
}