import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { ProductStatus, ProductImageType } from "generated/prisma/enums";

export type ProductInput = {
    url: string;
    altText?: string;
    type: ProductImageType;
}

export type ProductResultItem = {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    slug: string;
    status: ProductStatus;
    productImages: {
        url: string;
        createdAt: Date;
        type: ProductImageType;
        altText: string | null;
    }[];
    brand: {
        name: string;
        id: string;
    } | null;
    _count: {
        variants: number;
    };
}


class ProductRepository {
    public create = async (data: {
        name: string;
        slug: string;
        description: string;
    }, tx: PrismaTx = prisma) => {
        return await tx.product.create({
            data: {
                id: getUuid(),
                name: data.name,
                description: data.description,
                slug: data.slug,
            },
            select: { id: true },
        });
    }

    public addImages = async (
        productId: string, 
        image: ProductInput[],
        tx: PrismaTx = prisma
    ) => {
        await tx.productImage.createMany({
            data: image.map((img) => ({
                id: getUuid(),
                productId,
                url: img.url,
                altText: img.altText,
                type: img.type,
            })),
        });
    }

    public deleteImages = async (
        productId: string,
        type: ProductImageType,
        tx: PrismaTx = prisma
    ) => {
        await tx.productImage.deleteMany({
            where: {
                productId,
                type,
            },
        });
    }

    public update = async (id: string, data: {
        name?: string;
        slug?: string;
        description?: string;
        status?: ProductStatus;
        rating?: number;
        totalReviews?: number;
    }, tx: PrismaTx = prisma) => {
        return await tx.product.update({
            where: { id },
            data: { ...data },
        });
    }

    public getList = async (skip: number, take: number): Promise<ProductResultItem[]> => {
        return await prisma.product.findMany({
            skip,
            take,
            select: {
                id: true,
                name: true,
                slug: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                productImages: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        createdAt: true,
                    }
                },
                _count: {
                    select: {
                        variants: true,
                    }
                }
            }
        });
    }

    public count = async () => {
        return await prisma.product.count();
    }

    public findById = async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                rating: true,
                totalReviews: true,
                productImages: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        createdAt: true,
                    }
                },
                variants: {
                    select: {
                        id: true,
                        imageUrl: true,
                        sku: {
                            select: {
                                id: true,
                                price: true,
                                stock: true,
                                skuCode: true,
                                isActive: true,
                            }
                        },
                        size: true,
                        color: true,
                        material: true,
                    }
                },
                productCategories: {
                    select: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    }
                }
            }
        });
    }

    public getProductImages = async (productId: string) => {
        return await prisma.productImage.findMany({
            where: { productId },
        });
    }

    public exists = async (id: string) => {
        return await prisma.product.findUnique({
            where: { id },
            select: { id: true },
        });
    }

    public options = async () => {
        return await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: {
                id: true,
                name: true,
                slug: true,
                productImages: {
                    select: {
                        url: true,
                        type: true,
                    }
                }
            }
        });
    }
}

export const productRepository = new ProductRepository();