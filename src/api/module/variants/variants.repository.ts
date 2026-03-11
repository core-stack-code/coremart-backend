import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { VariantWhereInput } from "generated/prisma/models";


class VariantsRepository {
    public async createVariant(data: {
        productId: string;
        sizeId: string;
        colorId: string;
        materialId: string;
        imageUrl?: string;
    }, tx: PrismaTx = prisma) {
        return await tx.variant.create({
            data: {
                id: getUuid(),
                productId: data.productId,
                sizeId: data.sizeId,
                colorId: data.colorId,
                materialId: data.materialId,
                imageUrl: data.imageUrl,
            },
            select: {
                id: true,
                product: {
                    select: {
                        slug: true,
                    }
                },
                sizeId: true,
                colorId: true,
                materialId: true,
            },
        });
    }

    public async updateVariantImage(variantId: string, imageUrl: string | null) {
        await prisma.variant.update({
            where: { id: variantId },
            data: { imageUrl },
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
                        imageUrl: true,
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
    }, tx: PrismaTx = prisma) {
        await tx.sKU.create({
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

    public async findActiveSku(skuId: string, tx: PrismaTx = prisma) {
        return await tx.sKU.findFirst({
            where: { 
                id: skuId,
                isActive: true,
                variant: {
                    product: {
                        status: "ACTIVE"
                    }
                }
            },
            select: {
                id: true,
                stock: true
            }
        });
    }

    public async findActiveSkus(skuIds: string[], tx: PrismaTx = prisma) {
        return await tx.sKU.findMany({
            where: { 
                id: { in: skuIds },
                isActive: true,
                variant: {
                    product: {
                        status: "ACTIVE"
                    }
                }
            },
            select: {
                id: true,
                stock: true,
                price: true,
            }
        });
    }

    public async count(where: VariantWhereInput = {}) {
        return await prisma.variant.count({
            where,
        })
    }
}

export const variantsRepository = new VariantsRepository();