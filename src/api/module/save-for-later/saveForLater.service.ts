import { Types } from "mongoose";
import { SaveForLater } from "./saveForLater.model";
import { fetchUserSavedProducts } from "../../utils/dbUtils";


export const getSaveForLaterByProductId = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> => {
    const saveForLater = await SaveForLater.findOne({ productId, userId }).lean();
    return !!saveForLater;
}


export const getSaveForLaterList = async (userId: Types.ObjectId) => {
    return await fetchUserSavedProducts(SaveForLater, userId);
}


export const toggleSaveForLater = async (productId: Types.ObjectId, userId: Types.ObjectId) => {
    const existing = await SaveForLater.findOne({ productId, userId });

    if (existing) {
        await SaveForLater.deleteOne({ _id: existing._id });
    } else {
        await SaveForLater.create({ productId, userId });
    }
};