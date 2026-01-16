import { Document, model, Schema, Types } from "mongoose";

interface IAddress {
    userId: Types.ObjectId;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;

    normalized: {
        addressLine: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }
}

const normalizedSchema = new Schema({
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
})

const addressSchema = new Schema<IAddress>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    normalized: { type: normalizedSchema, required: true },
}, {
    versionKey: false,
    timestamps: true,
})

const Address = model<IAddress>('Address', addressSchema);

export type AddressDocument = IAddress & Document;

export interface AddressLean extends IAddress {
    _id: Schema.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

export type AddressLeanSelected = Omit<AddressLean, "normalized" | "createdAt" | "updatedAt">;

export default Address;