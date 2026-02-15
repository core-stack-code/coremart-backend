import { prisma } from "@core/config/prisma";
import { AppError } from "@core/utils/response";
import { addressRepository, AddressResultItem } from "./address.repository";
import { CreateAddressPayload, UpdateAddressPayload } from "./address.validator";

const MAX_ADDRESS_COUNT = 3;

class AddressService {
    public async handleCreate(userId: string, payload: CreateAddressPayload) {
        const addressCount = await addressRepository.count(userId);

        if (addressCount >= MAX_ADDRESS_COUNT) {
            throw new AppError(
                400,
                "BAD_REQUEST",
                `Maximum address limit (${MAX_ADDRESS_COUNT}) reached. Please delete an address before adding a new one.`
            );
        }

        await addressRepository.create({
            userId,
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            country: payload.country,
        });
    }

    public async handleUpdate(userId: string, addressId: string, payload: UpdateAddressPayload) {
        if (payload.isDefault === true) {
            await prisma.$transaction(async (tx) => {
                await addressRepository.clearDefaultForUser(userId, tx);

                const result = await addressRepository.update(userId, addressId, {
                    addressLine1: payload.addressLine1,
                    addressLine2: payload.addressLine2,
                    city: payload.city,
                    state: payload.state,
                    postalCode: payload.postalCode,
                    country: payload.country,
                    isDefault: true,
                }, tx);

                if (!result) {
                    throw new AppError(404, "RESOURCE_NOT_FOUND", "Address not found.");
                }
            });

            return;
        }

        const result = await addressRepository.update(userId, addressId, {
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            country: payload.country,
            isDefault: payload.isDefault,
        });

        if (!result) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Address not found.");
        }
    }

    public async handleDelete(userId: string, addressId: string) {
        const result = await addressRepository.delete(userId, addressId);

        if (!result) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Address not found.");
        }
    }

    public async handleGetList(userId: string): Promise<AddressResultItem[]> {
        return await addressRepository.findListByUserId(userId);
    }
}

export const addressService = new AddressService();
