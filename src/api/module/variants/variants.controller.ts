import { Request, Response } from "express";
import { variantsService } from "./variants.service";
import { 
    CreateProductSkuPayload,
    CreateProductVariantWithSkuPayload,
    UpdateProductSkuPayload,
    VariantImagePayload
} from "./variants.validator";
import { AppResponse } from "@core/utils/response";


class VariantsController {
    public async createVariants(req: Request, res: Response) {
        const productId = req.params.productId as string;
        const payload = req.body as CreateProductVariantWithSkuPayload;

        await variantsService.handleCreateVariants(productId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product variant created successfully.",
        });
    }

    public async updateVariantImage(req: Request, res: Response) {
        const variantId = req.params.variantId as string;
        const payload = req.body as VariantImagePayload;

        await variantsService.handleUpdateVariantImage(variantId, payload);
        
        AppResponse(res, 200, {
            code: "OK",
            message: "Product variant image updated successfully.",
        });
    }

    public async getVariants(req: Request, res: Response) {
        const productId = req.params.productId as string;

        const productVariants = await variantsService.productVariants(productId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product variants fetched successfully.",
            data: productVariants,
        });
    }

    public async deleteVariant(req: Request, res: Response) {
        const variantId = req.params.variantId as string;

        await variantsService.handleDeleteVariant(variantId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product variant deleted successfully.",
        });
    }

    public async createProductSku(req: Request, res: Response) {
        const variantId = req.params.variantId as string;
        const payload = req.body as CreateProductSkuPayload;

        await variantsService.handleCreateProductSku(variantId, payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Product SKU created successfully.",
        });
    }

    public async updateProductSku(req: Request, res: Response) {
        const skuId = req.params.skuId as string;
        const payload = req.body as UpdateProductSkuPayload;

        await variantsService.handleUpdateProductSku(skuId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product SKU updated successfully.",
        });
    }
}

export const variantsController = new VariantsController()