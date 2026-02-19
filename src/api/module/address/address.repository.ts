import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { CreateAddressPayload } from "./address.validator";
import { UserAddressCreateInput, UserAddressUpdateInput } from "generated/prisma/models";
import { ShippingAddress } from "@mod/order/order.repository";

export type AddressResultItem = {
    id: string;
    userId: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}


class AddressRepository {
    public create = async (data: {
        userId: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    }, tx: PrismaTx = prisma) => {
        return await tx.userAddress.create({
            data: {
                id: getUuid(),
                userId: data.userId,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2 || null,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
            },
        });
    }

    public update = async (userId: string, id: string, data: {
        addressLine1?: string;
        addressLine2?: string | null;
        city?: string;
        state?: string;
        postalCode?: string;
        country?: string;
        isDefault?: boolean;
    }, tx: PrismaTx = prisma) => {
        return await tx.userAddress.update({
            where: { id },
            data: {
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
                isDefault: data.isDefault,
            }
        });
    }

    public findListByUserId = async (userId: string): Promise<AddressResultItem[]> => {
        return await prisma.userAddress.findMany({
            where: { userId },
            select: {
                id: true,
                userId: true,
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                isDefault: true,
            },
            orderBy: { createdAt: "desc" },
        });
    }

    public count = async (userId: string, tx: PrismaTx = prisma): Promise<number> => {
        return await tx.userAddress.count({
            where: { userId },
        });
    }

    public clearDefaultForUser = async (userId: string, tx: PrismaTx = prisma) => {
        await tx.userAddress.updateMany({
            where: { userId, isDefault: true },
            data: { isDefault: false },
        });
    }

    public delete = async (userId: string, id: string) => {
        return await prisma.userAddress.delete({
            where: { id, userId }
        });
    }

    public findOne = async (
        userId: string, addressId: string, tx: PrismaTx = prisma
    ): Promise<ShippingAddress | null>  => {
        return await tx.userAddress.findUnique({
            where : {
                id: addressId,
                userId
            },
            select: {
                addressLine1: true,
                addressLine2: true,
                city: true,
                country: true,
                postalCode: true,
                state: true,
            }
        })
    }
}

export const addressRepository = new AddressRepository();
