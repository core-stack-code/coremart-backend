import { Request, Response } from "express";
import { productService } from "./product.service";
import { CreateProductPayload, ProductListQuery, UpdateProductPayload } from "./product.validator";
import { AppResponse } from "@api/utils/response";


class ProductController {
    public async createProduct(req: Request, res: Response) {
        const payload = req.body as CreateProductPayload;

        await productService.handleCreate(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product created successfully.",
        });
    }

    public async updateProduct(req: Request, res: Response) {
        const payload = req.body as UpdateProductPayload;
        const productId = req.params.productId as string;

        await productService.handleUpdate(productId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product updated successfully.",
        });
    }

    public async getProductList(req: Request, res: Response) {
        const query = req.localsQuery as ProductListQuery;
        
        const products = await productService.getProductList(query);

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

    public async getProductOptions(req: Request, res: Response) {
        const result = await productService.getProductOptions();

        AppResponse(res, 200, {
            code: "OK",
            message: "Product options fetched successfully.",
            data: result,
        });
    }
}

export const productController = new ProductController();