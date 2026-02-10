import { Request, Response } from "express";
import { CreateProductCategoryPayload } from "./productCategory.validator";
import { productCategoryService } from "./productCategory.service";
import { AppResponse } from "@core/utils/response";


class ProductCategoryController {
    public async createProductCategory(req: Request, res: Response) {
        const productId = req.params.productId as string;
        const payload = req.body as CreateProductCategoryPayload;

        await productCategoryService.createProductCategory(productId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product category created successfully.",
        });
    }

    public async deleteProductCategory(req: Request, res: Response) {
        const productId = req.params.productId as string;
        const categoryId = req.params.categoryId as string;

        await productCategoryService.deleteProductCategory(productId, categoryId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product category deleted successfully.",
        });
    }

    public async getProductByCategory(req: Request, res: Response) {
        const categoryId = req.params.categoryId;

        const products = await productCategoryService.getProductsByCategory(categoryId);

        AppResponse(res, 200, {
            code: "OK",
            message: `Products fetched successfully for category ${categoryId}.`,
            data: products,
        });
    }
}

export const productCategoryController = new ProductCategoryController();