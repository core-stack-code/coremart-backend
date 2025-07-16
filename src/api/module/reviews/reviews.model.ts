import { Document, model, Schema, Types } from "mongoose";

export interface IReviews {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    rating: number;
    title?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const reviewsSchema = new Schema<IReviews>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    description: { type: String, trim: true },
}, {
    versionKey: false,
    timestamps: true,
})

reviewsSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const Review = model<IReviews>('Review', reviewsSchema);

export type ReviewDocoment =   IReviews & Document;
export interface ReviewLean extends IReviews {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}