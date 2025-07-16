import { model, Schema, Types } from "mongoose";


interface IProductView {
    userId?: Types.ObjectId
    productId: Types.ObjectId
    viewedAt?: Date
}

const productViewSchema = new Schema<IProductView>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    viewedAt: { type: Date, default: Date.now },
}, {
    versionKey: false,
    timestamps: false
})

productViewSchema.index({ userId: 1, productId: 1, viewedAt: -1 });

export const ProductView = model<IProductView>('ProductView', productViewSchema);
