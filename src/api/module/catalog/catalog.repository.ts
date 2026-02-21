import { Prisma } from "generated/prisma/client";
import { prisma, PrismaTx } from "@core/config/prisma";

export type CategoryTreeItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    imageUrl: string | null;
}

export type CategoryTreeNode = CategoryTreeItem & {
    children: CategoryTreeNode[];
}

export type RawCategoryTreeItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    categoryImages: Array<{ url: string }>;
}


class CatalogRepository {
    public findProductBySlug = async (productSlug: string) => {
        return await prisma.product.findUnique({
            where: { slug: productSlug, status: "ACTIVE" },
            include: {
                brand: true,
                productImages: true,
                productCategories: {
                    include: {
                        category: true
                    }
                },
                variants: {
                    include: {
                        size: true,
                        color: true,
                        material: true,
                        sku: true
                    }
                }
            }
        })
    }

    public findProducts = async (args: {
        where: Prisma.ProductWhereInput,
        orderBy: Prisma.ProductOrderByWithRelationInput,
        skip: number,
        take: number
    }) => {
        return await prisma.product.findMany({
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                rating: true,
                totalReviews: true,
                brand: {
                    select: {
                        name: true,
                        slug: true,
                    },
                },
                variants: {
                    select: {
                        imageUrl: true,
                        sku: { select: { price: true } },
                    },
                },
                productImages: {
                    where: { type: "THUMBNAIL" },
                    select: {
                        url: true,
                        altText: true,
                    },
                    take: 1,
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
                categoryImages: {
                    where: { type: "IMAGE" },
                    select: {
                        url: true,
                    },
                    take: 1,
                }   
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
                categoryImages: {
                    where: { type: "IMAGE" },
                    select: {
                        url: true,
                    },
                }
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
        const productSelect = {
            id: true,
            name: true,
            slug: true,
            description: true,
            rating: true,
            totalReviews: true,
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
            productImages: {
                where: { type: "THUMBNAIL" },
                select: {
                    url: true,
                    altText: true,
                },
                take: 1,
            },
        } as const satisfies Prisma.ProductSelect;

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
            select: productSelect,
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

    public existActiveProduct = async (productId: string) => {
        return await prisma.product.findFirstOrThrow({
            where: {
                id: productId,
                status: "ACTIVE",
            },
            select: { id: true },
        });
    }

    public findProductReviews = async (productSlug: string) => {
        return await prisma.review.findMany({
            where: { 
                product: { slug: productSlug, status: "ACTIVE" },
            },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    }

    public async getRatingBreakdown(productId: string) {
        return await prisma.review.groupBy({
            by: ["rating"],
            where: { productId },
            _count: { rating: true }
        });
    }
}

export const catalogRepository = new CatalogRepository();