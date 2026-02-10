import { CreateProductSkuPayload, CreateProductVariantPayload, UpdateProductSkuPayload } from "./variants.validator";
import { variantsRepository } from "./variants.repository";

import { attributesService } from "@mod/attributes/attributes.service";
import { productRepository } from "@mod/product/product.repository";
import { AppError } from "@core/utils/response";
import { generateSkuCode, paiseToRupees, rupeesToPaise } from "./variants.utils";


class VariantsService {
    public async handleCreateVariants(id: string, payload: CreateProductVariantPayload) {
        const product = await productRepository.exists(id);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }

        await attributesService.checkAttributes(
            payload.sizeId,
            payload.colorId,
            payload.materialId
        )

        await variantsRepository.createVariant({
            productId: id,
            ...payload,
        })
    }

    public async productVariants(productId: string) {
        const variants =  await variantsRepository.getVariants(productId);

        const mapVariants = variants?.variants.map(vari => {
            const sku = vari.sku ? {
                ...vari.sku,
                price: paiseToRupees(vari.sku.price), // Convert paise to rupees
            } : null;

            return {
                ...vari,
                sku,
            }
        })
        
        return {
            ...variants,
            variants: mapVariants,
        }
    }

    public async handleDeleteVariant(variantId: string) {
        await variantsRepository.deleteVariant(variantId);
    }

    public async handleCreateProductSku(variantId: string, payload: CreateProductSkuPayload) {
        const variant = await variantsRepository.findOne(variantId);

        if (!variant) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product variant not found");
        }

        const skuCode = generateSkuCode(
            variant.product.slug, 
            variant.size.name, 
            variant.color.name, 
            variant.material.name
        );

        await variantsRepository.createProductSku({
            variantId,
            skuCode,
            price: rupeesToPaise(payload.price), // Convert rupees to paise
            stock: payload.stock,
            isActive: payload.isActive,
        });
    }

    public async handleUpdateProductSku(skuId: string, payload: UpdateProductSkuPayload) {
        await variantsRepository.updateProductSku(skuId, {
            price: payload.price ? rupeesToPaise(payload.price) : undefined, // Convert rupees to paise
            stock: payload.stock,
            isActive: payload.isActive,
        });
    }
}

export const variantsService = new VariantsService();