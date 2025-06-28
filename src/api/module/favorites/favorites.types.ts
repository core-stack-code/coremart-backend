import { Schema } from "mongoose";

export interface IFavorites {
    userId: Schema.Types.ObjectId;
    productId: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}