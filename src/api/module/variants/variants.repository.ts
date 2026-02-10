import { prisma } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";


class VariantsRepository {
     public async createVariant(data: {
        productId: string;
        sizeId: string;
        colorId: string;
        materialId: string;
    }) {
        await prisma.variant.create({
            data: {
                id: getUuid(),
                productId: data.productId,
                sizeId: data.sizeId,
                colorId: data.colorId,
                materialId: data.materialId,
            },
            select: null,
        });
    }

    public async getVariants(productId: string) {
        return await prisma.product.findUnique({
            where: { id: productId },
            select: {
                id: true,
                name: true,
                variants: {
                    select: {
                        id: true,
                        size: { select: { id: true, name: true } },
                        color: { select: { id: true, name: true } },
                        material: { select: { id: true, name: true } },
                        sku: {
                            select: {
                                id: true,
                                skuCode: true,
                                price: true,
                                stock: true,
                                isActive: true,
                            }
                        }
                    },
                },
            },
        });
    }

    public async deleteVariant(variantId: string) {
        await prisma.variant.delete({
            where: { id: variantId },
        });
    }

    public async findOne(variantId: string) {
        return await prisma.variant.findUnique({
            where: { id: variantId },
            select: {
                id: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                },
                size: { select: { id: true, name: true } },
                color: { select: { id: true, name: true } },
                material: { select: { id: true, name: true } },
            }
        });
    }

    public async createProductSku(data: {
        variantId: string;
        skuCode: string;
        price: number;
        stock: number;
        isActive: boolean;
    }) {
        await prisma.sKU.create({
            data: {
                id: getUuid(),
                variantId: data.variantId,
                skuCode: data.skuCode,
                price: data.price,
                stock: data.stock,
                isActive: data.isActive,
            },
        });
    }

    public async updateProductSku(skuId: string, data: {
        price?: number;
        stock?: number;
        isActive?: boolean;
    }) {
        await prisma.sKU.update({
            where: { id: skuId },
            data: {
                price: data.price,
                stock: data.stock,
                isActive: data.isActive,
            },
        });
    }
}

export const variantsRepository = new VariantsRepository();