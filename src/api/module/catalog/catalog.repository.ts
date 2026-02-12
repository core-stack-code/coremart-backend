import { Prisma } from "generated/prisma/client";
import { prisma, PrismaTx } from "@core/config/prisma";


class CatalogRepository {
    public findProductBySlug = async (productSlug: string) => {
        return await prisma.product.findUnique({
            where: { slug: productSlug, status: "ACTIVE" },
            select: {
                id: true,
                name: true,
                description: true,
                slug: true,
                createdAt: true,
                updatedAt: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    }
                }
            }
        })
    }

    public findCategoriesByProductId = async (productId: string) => {
        return await prisma.productCategory.findMany({
            where: { productId },
            select: {
                category: {
                    select: {
                        name: true,
                        slug: true,
                        isActive: true,
                    }
                }
            }
        });
    }

    public findProductVariantsByProductId = async (productId: string) => {
        return await prisma.variant.findMany({
            where: { productId },
            select: {
                size: { select: { name: true } },
                color: { select: { name: true } },
                material: { select: { name: true } },
                sku: {
                    select: {
                        skuCode: true,
                        price: true,
                        stock: true,
                        isActive: true,
                    }
                }
            }
        });
    }

    public findProducts = async ( args: {
        where: Prisma.ProductWhereInput,
        orderBy: Prisma.ProductOrderByWithRelationInput,
        skip: number,
        take: number
    }, tx: PrismaTx = prisma) => {
        return await tx.product.findMany({
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                brand: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                variants: {
                    select: {
                        sku: { select: { price: true } },
                    },
                },
            },
        });
    }

    public async countProducts(
        where: Prisma.ProductWhereInput,
        tx: PrismaTx = prisma
    ) {
        return tx.product.count({ where });
    }

    public async findRootCategories() {
        return await prisma.category.findMany({
            where: { parentId: null, isActive: true }, 
            select: {
                name: true,
                slug: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    public async findCategoryBySlug(slug: string) {
        return await prisma.category.findUnique({
            where: { slug, isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
            }
        });
    }

    public async findAllActiveCategories() {
        return prisma.category.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
            },
            orderBy: {
                name: "asc",
            },
        });
    }

    public async productListByCategory(args: {
        categoryId: string,
        orderBy: Prisma.ProductOrderByWithRelationInput,
        skip: number,
        take: number
    }) {
        return await prisma.product.findMany({
            where: {
                status: "ACTIVE",
                productCategories: {
                    some: {
                        categoryId: args.categoryId,
                    }
                },
                variants: {
                    some: {
                        sku: { is: { isActive: true } },
                    },
                },
            },
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                brand: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                variants: {
                    where: {
                        sku: { is: { isActive: true } },
                    },
                    select: {
                        sku: { select: { price: true } },
                    },
                },
            },
        })
    }

    public async countProductsByCategory(categoryId: string) {
        return prisma.product.count({
            where: {
                status: "ACTIVE",
                productCategories: {
                    some: {
                        categoryId,
                    },
                },
                variants: {
                    some: {
                        sku: { is: { isActive: true } },
                    },
                },
            },
        });
    }
}

export const catalogRepository = new CatalogRepository();