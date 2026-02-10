import { Request, Response } from "express";
import { productService } from "./product.service";
import { CreateProductPayload, UpdateProductPayload } from "./product.validator";
import { AppResponse } from "@core/utils/response";


class ProductController {
    public async createProduct(req: Request, res: Response) {
        const payload = req.body as CreateProductPayload;

        const product = await productService.handleCreate(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product created successfully.",
            data: product,
        });
    }

    public async updateProduct(req: Request, res: Response) {
        const payload = req.body as UpdateProductPayload;
        const productId = req.params.productId as string;

        const product = await productService.handleUpdate(productId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product updated successfully.",
            data: product,
        });
    }

    public async getProductList(_req: Request, res: Response) {
        const products = await productService.getProductList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Product list fetched successfully.",
            data: products,
        });
    }

    public async getProduct(req: Request, res: Response) {
        const productId = req.params.productId as string;

        const product = await productService.getProduct(productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product fetched successfully.",
            data: product,
        });
    }
}

export const productController = new ProductController();