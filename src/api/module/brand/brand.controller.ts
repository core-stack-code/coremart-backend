import { Request, Response } from "express";
import { brandService } from "./brand.service";
import { CreateBrandPayload, UpdateBrandPayload } from "./brand.validator";
import { AppResponse } from "@core/utils/response";

class BrandController {
    public async createBrand(req: Request, res: Response) {
        const payload = req.body as CreateBrandPayload;

        const brand = await brandService.handleCreate(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Brand created successfully.",
            data: brand,
        });
    }

    public async updateBrand(req: Request, res: Response) {
        const payload = req.body as UpdateBrandPayload;
        const brandId = req.params.brandId as string;

        const brand = await brandService.handleUpdate(brandId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Brand updated successfully.",
            data: brand,
        });
    }

    public async getBrandList(_req: Request, res: Response) {
        const brands = await brandService.getBrandList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Brand list fetched successfully.",
            data: brands,
        });
    }

    public async getBrandSimpleList(_req: Request, res: Response) {
        const brands = await brandService.getBrandSimpleList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Brand simple list fetched successfully.",
            data: brands,
        });
    }

    public async assignProduct(req: Request, res: Response) {
        const brandId = req.params.brandId as string;
        const productId = req.params.productId as string;

        await brandService.assignProduct(brandId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product assigned to brand successfully.",
            data: null,
        });
    }

    public async removeProduct(req: Request, res: Response) {
        const brandId = req.params.brandId as string;
        const productId = req.params.productId as string;

        await brandService.removeProduct(brandId, productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product removed from brand successfully.",
            data: null,
        });
    }
}

export const brandController = new BrandController();
