import mongoose, { Schema, Types } from "mongoose";
import { CutomerDetials, OrderStatus, ProductItem, ShippingAddress } from "./order.types";

export interface IOrder {
    userId: Types.ObjectId;
    orderItems: ProductItem[];
    shippingAddress: ShippingAddress;
    itemTotal: number;
    
    order_amount: number;
    order_currency: string;
    cutomerDetails: CutomerDetials;

    cf_order_id?: string;
    status: OrderStatus;
    order_created_at: Date | null;
    payment_session_id: string | null;
}

export interface OrderLean extends IOrder {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderDocument extends IOrder, Document {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const orderItemsSchema = new Schema<ProductItem>({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
}, {
    _id: false,
    versionKey: false,
})

const shippingAddressSchema = new Schema<ShippingAddress>({
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
}, {
    _id: false,
    versionKey: false,
})

const cutomerDetailsSchema = new Schema<CutomerDetials>({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
}, {
    _id: false,
    versionKey: false,
})


const orderSchema = new mongoose.Schema<OrderDocument>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: { type: [orderItemsSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    itemTotal: { type: Number, required: true },

    order_amount: { type: Number, required: true },
    order_currency: { type: String, required: true, default: 'INR' },
    cutomerDetails: { type: cutomerDetailsSchema, required: true },

    cf_order_id: { type: String, unique: true, sparse: true },
    status: { type: String, default: 'ACTIVE' },
    order_created_at: { type: Date, default: null },
    payment_session_id: { type: String, default: null },
}, {
    versionKey: false,
    timestamps: true,
})

const Order = mongoose.model<OrderDocument>('Order', orderSchema);

export default Order;