import { Request, Response } from "express";
import { discountService } from "./discount.service";
import {
    CreateDiscountPayload,
    UpdateDiscountPayload,
    ReplaceScopePayload,
    DiscountListQuery,
} from "./discount.validator";
import { AppResponse } from "@api/utils/response";


class DiscountController {
    public async createDiscount(req: Request, res: Response) {
        const payload = req.body as CreateDiscountPayload;

        await discountService.createDiscount(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "New discount created"
        });
    }

    public async updateDiscount(req: Request, res: Response) {
        const discountId = req.params.discountId;
        const payload = req.body as UpdateDiscountPayload;

        await discountService.updateDiscount(discountId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Discount updated",
        });
    }

    public async replaceScope(req: Request, res: Response) {
        const discountId = req.params.discountId;
        const payload = req.body as ReplaceScopePayload;

        const result = await discountService.replaceScope(discountId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Discount scope replaced",
            data: result,
        });
    }

    public async getDiscountList(req: Request, res: Response) {
        const query = req.localsQuery as DiscountListQuery;

        const result = await discountService.getDiscountList(query);

        AppResponse(res, 200, {
            code: "OK",
            message: "Discounts retrieved",
            data: result,
        });
    }

    public async getDiscountById(req: Request, res: Response) {
        const discountId = req.params.discountId;

        const result = await discountService.getDiscountById(discountId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Discount details retrieved",
            data: result,
        });
    }

    public async deleteDiscount(req: Request, res: Response) {
        const discountId = req.params.discountId;

        await discountService.deleteDiscount(discountId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Discount deleted",
        });
    }
}

export const discountController = new DiscountController();