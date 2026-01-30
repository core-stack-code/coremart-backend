import { Types  } from "mongoose";
import { Cart } from "./cart.model";
import { AppError } from "../../../core/utils/response";
import { CartResponse } from "./cart.types";


export const getCart = async (userId: Types.ObjectId): Promise<CartResponse> => {
    const result = await Cart.aggregate([
        { $match: { userId } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: 0,
                product: {
                    _id: "$product._id",
                    name: "$product.name",
                    slug: "$product.slug",
                    category: "$product.category",
                    price: "$product.price",
                    image: { $arrayElemAt: ["$product.images", 0] }
                },
                quantity: "$items.quantity",
                itemTotal: { $multiply: ["$items.quantity", "$product.price"] }
            }
        },
        {
            $group: {
                _id: null,
                items: { $push: "$$ROOT" },
                totalPrice: { $sum: "$itemTotal" },
                totalQuantity: { $sum: "$quantity" },
            }
        },
        {
            $project: {
                _id: 0,
                items: 1,
                totalPrice: 1,
                totalQuantity: 1
            }
        }
    ]);

    return result[0] || { items: [], totalPrice: 0, totalQuantity: 0 };
};



export const addToCart = async (userId: Types.ObjectId, productId: Types.ObjectId) => {
    const updateExisting = await Cart.updateOne(
        { userId, 'items.product': productId,},
        {
            $inc: { 'items.$.quantity': 1 },
        }
    );

    if (updateExisting.modifiedCount === 0) {
        await Cart.updateOne(
            { userId },
            {
                $push: { items: { product: productId, quantity: 1 } },
                $setOnInsert: { userId },
            },
            { upsert: true }
        );
    }
}


export const removFromCart = async (userId: Types.ObjectId, productId: Types.ObjectId) => {
    const userCart = await Cart.updateOne(
        { userId, 'items.product': productId },
        { 
            $inc: { 'items.$.quantity': -1 }
        }
    );

    if (userCart.modifiedCount  === 0) {
        throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found in cart to remove");
    }

    await Cart.updateOne(
        { userId },
        { $pull: { items: { product: productId, quantity: { $lte: 0 } } } }
    );
}


export const deleteItemFromCart = async ( userId: Types.ObjectId, productId: Types.ObjectId) => {
    await Cart.updateOne(
        { userId },
        { $pull: { items: { product: productId } } }
    );
};


export const clearCart = async (userId: Types.ObjectId) => {
    await Cart.updateOne(
        { userId },
        { $set: { items: [] } }
    );
};
