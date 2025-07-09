import { Types } from "mongoose";
import { ProductView } from "./productView.modal";

export const addViewToProduct = async (productId: Types.ObjectId, userId?: Types.ObjectId) => {
    const view = new ProductView({
        productId,
        ...(userId && { userId }),
    });
    await view.save();
}

const getProductViews = async (productId: Types.ObjectId) => {
    return await ProductView.find({ productId }).sort({ viewedAt: -1 }).lean();
}

const getUserProductViews = async (userId: Types.ObjectId) => {
    return await ProductView.find({ userId }).sort({ viewedAt: -1 }).lean();
}