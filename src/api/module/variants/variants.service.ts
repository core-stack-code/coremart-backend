import { prisma } from "@core/config/prisma";
import { variantsRepository } from "./variants.repository";
import { generateSkuCode } from "./variants.utils";
import {
    CreateProductSkuPayload, CreateProductVariantWithSkuPayload, UpdateProductSkuPayload, VariantImagePayload
} from "./variants.validator";

import { attributesService } from "@mod/attributes/attributes.service";
import { productRepository } from "@mod/product/product.repository";
import { paiseToRupees, rupeesToPaise } from "@core/utils/product.helper";
import { AppError } from "@api/utils/response";


class VariantsService {
    public async handleCreateVariants(id: string, payload: CreateProductVariantWithSkuPayload) {
        const product = await productRepository.exists(id);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }

        await attributesService.checkAttributes(
            payload.sizeId,
            payload.colorId,
            payload.materialId
        )

        await prisma.$transaction(async (tx) => {
            const variant = await variantsRepository.createVariant({
                productId: id,
                ...payload,
            }, tx)

            // Log.info("Variant created with ID: " + variant);

            const skuCode = generateSkuCode(
                variant.product.slug, 
                variant.size.name, 
                variant.color.name, 
                variant.material.name
            );

            await variantsRepository.createProductSku({
                variantId: variant.id,
                skuCode,
                price: payload.sku.price,
                stock: payload.sku.stock,
                isActive: payload.sku.isActive,
            }, tx);
        })
    }

    public async handleUpdateVariantImage(variantId: string, payload: VariantImagePayload) {
        await variantsRepository.updateVariantImage(variantId, payload.imageUrl);
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
            price: payload.price,
            stock: payload.stock,
            isActive: payload.isActive,
        });
    }
}

export const variantsService = new VariantsService();