import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";

class BrandRepository {
    public create = async (data: {
        name: string;
        slug: string;
        logUrl: string | null;
    }) => {
        return await prisma.brand.create({
            data: {
                id: getUuid(),
                name: data.name,
                slug: data.slug,
                logoUrl: data.logUrl,
            },
            select: null,
        });
    }

    public update = async (id: string, data: {
        name?: string;
        slug?: string;
        isActive?: boolean;
        logoUrl?: string | null;
    }, tx: PrismaTx = prisma) => {
        return await tx.brand.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                isActive: data.isActive,
                logoUrl: data.logoUrl,
            },
            select: null,
        });
    }

    public exists = async (id: string) => {
        return await prisma.brand.findUnique({
            where: { id },
            select: { id: true },
        });
    }

    public findAllWithProductCount = async () => {
        return await prisma.brand.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                isActive: true,
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    public assignProductToBrand = async (brandId: string, productId: string, tx: PrismaTx = prisma) => {
        return await tx.product.update({
            where: { id: productId },
            data: { brandId },
            select: null,
        });
    }

    public removeProductFromBrand = async (productId: string, tx: PrismaTx = prisma) => {
        return await tx.product.update({
            where: { id: productId },
            data: { brandId: null },
            select: null,
        });
    }

    public count = async () => {
        return await prisma.brand.count()
    }
}

export const brandRepository = new BrandRepository();
