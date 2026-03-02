import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { Category, CategoryImageType } from "generated/prisma/client";

export type CategoryTreeItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    imageUrl: {
        url: string;
        altText: string | null;
    } | null;
}

export type CategoryTreeNode = CategoryTreeItem & {
    children: CategoryTreeNode[];
}

export type CategoryListItem = Omit<CategoryTreeItem, "imageUrl"> & {
    isActive: boolean;
    categoryImages: {
        url: string,
        altText: string | null,
        type: CategoryImageType,
        createdAt: Date, 
    }[]
    createdAt: Date,
    updatedAt: Date,
}


export type CategoryImageInput = {
    url: string;
    altText?: string;
    type: CategoryImageType;
}


class CategoryRepository {
    public findByID = async (id: string) => {
        return await prisma.category.findUnique({
            where: { id },
            select: {
                isActive: true,
                id: true,
                slug: true,
                parentId: true,
                name: true,
                parent: {
                    select: {
                        slug: true,
                    }
                }
            }
        });
    }

    public create = async (data: {
        name: string;
        parentId?: string;
        slug: string;
    }, tx: PrismaTx = prisma) => {
        return await tx.category.create({
            data: {
                id: getUuid(),
                slug: data.slug,
                name: data.name,
                parentId: data.parentId || null,
            },
            select: { id: true },
        });
    }

    public addImages = async (
        categoryId: string, 
        images: CategoryImageInput[],
        tx: PrismaTx = prisma
    ) => {
        await tx.categoryImage.createMany({
            data: images.map((img) => ({
                id: getUuid(),
                categoryId,
                ...img
            })),
        });
    }

    public deleteImages = async (
        categoryId: string,
        type: CategoryImageType,
        tx: PrismaTx = prisma
    ) => {
        await tx.categoryImage.deleteMany({
            where: {
                categoryId,
                type,
            },
        });
    }

    public update = async (id: string, data: {
        name?: string;
        parentId?: string | null;
        slug?: string;
        isActive?: boolean
    }, tx: PrismaTx = prisma) => {
        return await tx.category.update({
            where: { id },
            data: {
                name: data.name,
                parentId: data.parentId,
                slug: data.slug,
            },
            select: null,
        });
    }

    public findDescendants = async (categoryId: string) => {
        const descendants: Array<Pick<Category, "id" | "parentId" | "slug">> = [];

        let queue: string[] = [categoryId];

        while (queue.length > 0) {
            const children = await prisma.category.findMany({
                where: {
                    parentId: { in: queue },
                },
                select: {
                    id: true,
                    slug: true,
                    parentId: true,
                },
            });

            if (children.length === 0) break;

            descendants.push(...children);
            queue = children.map(child => child.id);
        }

        return descendants;
    }

    public findList = async (): Promise<CategoryListItem[]> => {
        return await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                isActive: true,
                categoryImages: {
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                        createdAt: true,
                    }
                },
                createdAt: true,
                updatedAt: true,
            },
            orderBy: [
                { parentId: 'asc' },
                { name: 'asc' },
            ],
        });
    }

    public findAll = async () => {
        return await prisma.category.findMany({
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
                        altText: true,
                    },
                    take: 1,
                }
            },
            orderBy: [
                { parentId: 'asc' },
                { name: 'asc' },
            ],
        });
    }

    public findUnique = async (id: string) => {
        return await prisma.category.findUnique({
            where: { id },
            select: {
                isActive: true,
            }
        });
    }
}

export const categoryRepository = new CategoryRepository();