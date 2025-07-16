import { Types  } from "mongoose";
import { Cart, ICart } from "./cart.model";
import { CustomError } from "../../utils/response";
import { devLooger } from "../../utils/devLogger";


export const getCart = async (userId: Types.ObjectId): Promise<ICart> => {
    const userCart = await Cart.findOne({ userId }).lean();

    if (!userCart) {
        return {
            userId,
            items: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    return userCart;
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
        throw new CustomError('Product not found in cart to remove', 404);
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
