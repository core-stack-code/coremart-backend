import { prisma } from "@core/config/prisma";


class ProductCategoryRepository {
    public async create(productId: string, categoryId: string) {
        await prisma.productCategory.create({
            data: {
                productId,
                categoryId
            }
        });
    }

    public async delete(productId: string, categoryId: string) {
        await prisma.productCategory.delete({
            where: {
                productId_categoryId: {
                    productId,
                    categoryId
                }
            }
        });
    }

    public async findProductsByCategory(categoryId: string) {
        return prisma.productCategory.findMany({
            where: { categoryId },
            select: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        status: true,
                        brand: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        })
    }
}

export const productCategoryRepository = new ProductCategoryRepository();