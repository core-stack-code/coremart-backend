import { Document, model, Schema, Types } from "mongoose";

interface ICartItem {
    product: Types.ObjectId;
    quantity: number;
}

export interface ICart {
    userId: Types.ObjectId;
    items: ICartItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

const cartItemSchema = new Schema<ICartItem>({
    product: { 
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
},
    {
        _id: false,
        versionKey: false,
    }
);

const cartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: {
        type: [cartItemSchema],
        default: []
    }
}, {
    versionKey: false,
    timestamps: true,
})

cartSchema.index({ userId: 1 }, { unique: true });

cartSchema.index({ userId: 1, 'items.product': 1 });    

export const Cart = model<ICart>('Cart', cartSchema);

export type CartDocument = ICart & Document;
export interface CartLean extends ICart {
    _id: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}