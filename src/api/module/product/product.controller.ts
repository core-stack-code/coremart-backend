import { Request, Response } from "express";
import { productService } from "./product.service";
import { CreateProductPayload, CreateProductVariantPayload, UpdateProductPayload } from "./product.validator";
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

    public async createVariants(req: Request, res: Response) {
        const productId = req.params.productId as string;
        const payload = req.body as CreateProductVariantPayload;

        await productService.handleCreateVariants(productId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product variant created successfully.",
        });
    }

    public async getVariants(req: Request, res: Response) {
        const productId = req.params.productId as string;

        const productVariants = await productService.productVariants(productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product variants fetched successfully.",
            data: productVariants,
        });
    }

    public async deleteVariant(req: Request, res: Response) {
        const variantId = req.params.variantId as string;

        await productService.handleDeleteVariant(variantId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product variant deleted successfully.",
        });
    }
}

export const productController = new ProductController();