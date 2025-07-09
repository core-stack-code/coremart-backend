import { model, Schema, Types } from "mongoose";

export interface ISaveForLater {
    userId: Types.ObjectId;
    productId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const saveForLaterSchema = new Schema<ISaveForLater>({
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

saveForLaterSchema.index({ userId: 1, productId: 1 }, { unique: true });

export const SaveForLater = model<ISaveForLater>('SaveForLater', saveForLaterSchema);
