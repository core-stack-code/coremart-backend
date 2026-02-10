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
}

export const productRepository = new ProductRepository();