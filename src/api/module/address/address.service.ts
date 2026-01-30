import { Types } from "mongoose";
import Address, { AddressLean, AddressLeanSelected } from "./address.model";
import { AddressPayload } from "./address.schema";
import { AppError } from "../../../core/utils/response";
import { log } from "../../utils/log";

const normalize = (text: string) => text.trim().toLowerCase();


export const addAddressService = async (userID: Types.ObjectId, payload: AddressPayload) => {
    const normalized = {
        addressLine: normalize(payload.addressLine),
        city: normalize(payload.city),
        state: normalize(payload.state),
        postalCode: payload.postalCode.trim(),
        country: normalize(payload.country),
    };

    const exists = await Address.exists({
        userId: userID,
        "normalized.addressLine": normalized.addressLine,
        "normalized.city": normalized.city,
        "normalized.state": normalized.state,
        "normalized.postalCode": normalized.postalCode,
        "normalized.country": normalized.country,
    });

    log.info('exists in add address', exists)

    if (exists) {
        throw new AppError(409, "CONFLICT","Address already exists");
    }

    const address = new Address({
        ...payload,
        userId: userID,
        normalized,
    });
    await address.save();
    return address;
}


export const getAddressCountPerUser = async (userID: Types.ObjectId): Promise<number> => {
    const count = await Address.countDocuments({ userID });
    return count;
}

export const getAddressById = async (addressId: Types.ObjectId): Promise<AddressLeanSelected> => {
    const address = await Address.findById(addressId)
        .select('-normalized -createdAt -updatedAt')
        .lean<AddressLeanSelected>();

    if (!address){
        throw new AppError(404, "RESOURCE_NOT_FOUND","Address not found");
    }
    return address;
}