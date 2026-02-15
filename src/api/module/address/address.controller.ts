
import { Request, Response } from "express";
import { addressService } from "./address.service";
import { CreateAddressPayload, UpdateAddressPayload } from "./address.validator";
import { AppResponse } from "@core/utils/response";

class AddressController {
    public async createAddress(req: Request, res: Response) {
        const userId = req.user!.id;
        const payload = req.body as CreateAddressPayload;

        await addressService.handleCreate(userId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Address created successfully.",
        });
    }

    public async updateAddress(req: Request, res: Response) {
        const { addressId } = req.params;
        const payload = req.body as UpdateAddressPayload;
        const userId = req.user!.id;

        await addressService.handleUpdate(userId, addressId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Address updated successfully.",
        });
    }

    public async deleteAddress(req: Request, res: Response) {
        const { addressId } = req.params;
        const userId = req.user!.id;

        await addressService.handleDelete(userId, addressId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Address deleted successfully.",
        });
    }

    public async getAddressList(req: Request, res: Response) {
        const userId = req.user!.id;

        const addresses = await addressService.handleGetList(userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Addresses fetched successfully.",
            data: addresses,
        });
    }
}

export const addressController = new AddressController();
