import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { Category, CategoryImageType } from "generated/prisma/client";

export type CategoryTreeItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    image: {
        url: string;
        altText: string | null;
    } | null;
    baseImage: {
        url: string;
        altText: string | null;
    } | null;
}

export type CategoryWithImages = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    categoryImages: {
        url: string;
        altText: string | null;
        type: CategoryImageType;
    }[];
}

export type CategoryTreeNode = CategoryTreeItem & {
    children: CategoryTreeNode[];
}

export type CategoryListItem = Omit<CategoryTreeItem, "image" | "baseImage"> & {
    isActive: boolean;
    categoryImages: {
        url: string,
        altText: string | null,
        type: CategoryImageType,
        createdAt: Date, 
    }[]
    createdAt: Date,
    updatedAt: Date,
    parent: {
        id: string;
        name: string;
    } | null;
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
                        id: true,
                        name: true,
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
                isActive: data.isActive,
            },
            select: null,
        });
    }

    public findDirectChildren = async (parentIds: string[]) => {
        return await prisma.category.findMany({
            where: {
                parentId: { in: parentIds },
            },
            select: {
                id: true,
                slug: true,
                parentId: true,
            },
        });
    }

    public findList = async (options?: {
        skip?: number;
        take?: number;
    }): Promise<CategoryListItem[]> => {
        return await prisma.category.findMany({
            skip: options?.skip,
            take: options?.take,
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
                parent: {
                    select: {
                        id: true,
                        name: true,

                    }
                }
            },
            orderBy: [
                { parentId: 'asc' },
                { name: 'asc' },
            ],
        });
    }

    public count = async () => {
        return await prisma.category.count();
    };

    public findAll = async () => {
        return await prisma.category.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                categoryImages: {
                    where: { 
                        type: { 
                            in: ["IMAGE", "BANNER"] 
                        } 
                    },
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                    },
                },
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

    public findCategoryTree = async (categoryId: string) => {
        return await prisma.category.findUnique({
            where: { id: categoryId },
            select: {
                id: true,
                name: true,
                slug: true,
                parentId: true,
                categoryImages: {
                    where: { 
                        type: { 
                            in: ["IMAGE", "BANNER"] 
                        } 
                    },
                    select: {
                        url: true,
                        altText: true,
                        type: true,
                    },
                },
            }
        });
    }
}

export const categoryRepository = new CategoryRepository();