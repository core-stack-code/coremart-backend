import { prisma } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { ProductStatus } from "generated/prisma/enums";

export type UpdateProductInput = {
    name?: string;
    slug?: string;
    description?: string;
    status?: ProductStatus;
}


class ProductRepository {

    // -------------------- Product --------------------

    public create = async (data: {
        name: string;
        slug: string;
        description: string;
    }) => {
        return await prisma.product.create({
            data: {
                id: getUuid(),
                name: data.name,
                description: data.description,
                slug: data.slug,
            },
        });
    }

    public update = async (id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        status?: ProductStatus;
    }) => {
        return await prisma.product.update({
            where: { id },
            data: { ...data },
        });
    }

    public getList = async () => {
        return await prisma.product.findMany();
    }

    public findById = async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
        });
    }

    public exists = async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
            select: { id: true },
        });
    }


    // -------------------- Variants --------------------

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
}

export const productRepository = new ProductRepository();