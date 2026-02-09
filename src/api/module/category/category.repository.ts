import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import { Category } from "generated/prisma/client";

export type CategoryListItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
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
    }) => {
        return await prisma.category.create({
            data: {
                id: getUuid(),
                slug: data.slug,
                name: data.name,
                parentId: data.parentId || null,
            },
            select: null,
        });
    }

    public update = async (id: string, data: {
        name?: string;
        parentId?: string | null;
        slug?: string;
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

    public toggleActive = async (id: string, isActive: boolean) => {
        await prisma.category.update({
            where: { id },
            data: { isActive: !isActive },
            select: null,
        });
    }
}

export const categoryRepository = new CategoryRepository();