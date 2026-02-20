import { prisma } from "@core/config/prisma";
import { AppError } from "@core/utils/response";
import { addressRepository, AddressResultItem, MAX_ADDRESS_COUNT } from "./address.repository";
import { CreateAddressPayload, UpdateAddressPayload } from "./address.validator";


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

                await addressRepository.update(userId, addressId, {
                    addressLine1: payload.addressLine1,
                    addressLine2: payload.addressLine2,
                    city: payload.city,
                    state: payload.state,
                    postalCode: payload.postalCode,
                    country: payload.country,
                    isDefault: true,
                }, tx);
            });

            return;
        }

        await addressRepository.update(userId, addressId, {
            addressLine1: payload.addressLine1,
            addressLine2: payload.addressLine2,
            city: payload.city,
            state: payload.state,
            postalCode: payload.postalCode,
            country: payload.country,
            isDefault: payload.isDefault,
        });
    }

    public async handleDelete(userId: string, addressId: string) {
        await addressRepository.delete(userId, addressId);
    }

    public async handleGetList(userId: string): Promise<AddressResultItem[]> {
        return await addressRepository.findListByUserId(userId);
    }
}

export const addressService = new AddressService();
