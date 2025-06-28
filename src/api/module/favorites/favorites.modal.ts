import { model, Schema } from "mongoose";
import { IFavorites } from "./favorites.types";

const favoritesSchema = new Schema<IFavorites>({
    userId: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: { 
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
}, {
    versionKey: false,
    timestamps: true,
})

favoritesSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Favorites = model<IFavorites>('Favorites', favoritesSchema);
