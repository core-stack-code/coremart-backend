import { prisma } from "@core/config/prisma";
import { CategoryImageInput, CategoryTreeNode, categoryRepository, CategoryTreeItem, CategoryWithImages } from "./category.repository";
import { CategoryListQuery, CreateCategoryPayload, UpdateCategoryPayload } from "./category.validator";

import { AppError } from "@api/utils/response";
import { slugify } from "@core/utils/db.helper";
import { deleteRedisCacheByPattern } from "@core/lib/redis/cache";
import { getRedisKeys } from "@core/utils/gerRedisKeys";


class CategoryService {
    public handleCreate = async (payload: CreateCategoryPayload) => {
        let slug: string;

        if (payload.parentId) {
            const parentCategorySlug = await this.checkCategoryActive(payload.parentId);
            slug = parentCategorySlug + "-" + slugify(payload.name);
        } else {
            slug = slugify(payload.name);
        }

        await prisma.$transaction(async (tx) => {
            const category = await categoryRepository.create({
                name: payload.name,
                parentId: payload.parentId,
                slug,
            }, tx);

            const images: CategoryImageInput[] = [];

            if (payload.bannerImageUrl) {
                images.push({
                    url: payload.bannerImageUrl.url,
                    altText: payload.bannerImageUrl.altText,
                    type: "BANNER",
                });
            }

            if (payload.imageUrl) {
                images.push({
                    url: payload.imageUrl.url,
                    altText: payload.imageUrl.altText,
                    type: "IMAGE",
                });
            }

            if (images.length > 0) {
                await categoryRepository.addImages(category.id, images, tx);
            }
        });
    }

    public handleUpdate = async (id: string, payload: UpdateCategoryPayload) => {
        await prisma.$transaction(async (tx) => {
            // get category that want to update.
            const category = await categoryRepository.findByID(id);

            if (!category) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found.");
            }

            const isParentChanging = payload.parentId !== undefined && payload.parentId !== category.parentId;
            const isNameChanging = payload.name !== undefined && payload.name !== category.name;

            // block self-parenting.
            if (isParentChanging && payload.parentId === id) {
                throw new AppError(409, "CONFLICT", "A category cannot be its own parent.");
            }

            // resolve the new parent slug if parent changes.
            let newParentSlug: string | null = category.parent?.slug ?? null;
            if (isParentChanging && payload.parentId !== null) {
                newParentSlug = await this.checkCategoryActive(payload.parentId!);
            }

            // get descendants and prevent circular parent links.
            let descendants: Array<{ id: string; slug: string }> = [];
            if (isParentChanging || isNameChanging) {
                descendants = await this.findDescendants(id);

                if (isParentChanging && payload.parentId && descendants.some(d => d.id === payload.parentId!)) {
                    throw new AppError(409, "CONFLICT", "Cannot create circular reference.");
                }
            }

            // compute final values and slug
            const finalName = payload.name ?? category.name;
            const finalParentId = payload.parentId !== undefined ? payload.parentId : category.parentId;
            
            let newSlug = category.slug;
            if (isParentChanging || isNameChanging) {
                const slugBase = slugify(finalName);
                const parentSlug = finalParentId ? newParentSlug : null;
                newSlug = parentSlug ? `${parentSlug}-${slugBase}` : slugBase;
            }

            // update the category record.
            await categoryRepository.update(id, {
                name: finalName,
                parentId: finalParentId,
                slug: newSlug,
                isActive: payload.isActive
            }, tx);

            // update images if needed.
            const images: CategoryImageInput[] = [];

            if (payload.bannerImageUrl !== undefined) {
                await categoryRepository.deleteImages(id, "BANNER", tx)

                if (payload.bannerImageUrl) {
                    images.push({
                        url: payload.bannerImageUrl.url,
                        altText: payload.bannerImageUrl.altText,
                        type: "BANNER",
                    });
                }
            }

            if (payload.imageUrl !== undefined) {
                await categoryRepository.deleteImages(id, "IMAGE", tx)

                if (payload.imageUrl) {
                    images.push({
                        url: payload.imageUrl.url,
                        altText: payload.imageUrl.altText,
                        type: "IMAGE",
                    });
                }
            }

            if (images.length > 0) {
                await categoryRepository.addImages(id, images, tx);
            }

            // update descendant slugs if the base slug changed.
            if ((isParentChanging || isNameChanging) && descendants.length > 0) {
                await Promise.all(
                    descendants.map(child =>
                        categoryRepository.update(
                            child.id,
                            { slug: child.slug.replace(category.slug, newSlug) },
                            tx
                        )
                    )
                );
            }

            await deleteRedisCacheByPattern(getRedisKeys('cache', 'categories:products', '*'));
        });
    }

    public handleGetTree = async (categoryId: string): Promise<CategoryTreeNode[]> => {
        const category = await categoryRepository.findCategoryTree(categoryId);
        
        if (!category) {
            return [];
        }
        
        const descendants = await this.findDescendants(categoryId);
        const descendantIds = descendants.map(d => d.id);
        
        let allCategories: CategoryWithImages[] = [category];
        
        if (descendantIds.length > 0) {
            const descendantCategories = await categoryRepository.findAll();
            allCategories = [
                category, 
                ...descendantCategories.filter(cat => 
                    descendantIds.includes(cat.id)
                )
            ];
        }
        
        const categories: CategoryTreeItem[] = allCategories.map(cat => {
            const { categoryImages, ...rest } = cat;
            const imageUrl = categoryImages.find(img => img.type === "IMAGE")
            const baseImageUrl = categoryImages.find(img => img.type === "BANNER")
            
            return {
                ...rest,
                image: imageUrl ? {
                    url: imageUrl.url,
                    altText: imageUrl.altText
                } : null,
                baseImage: baseImageUrl ? {
                    url: baseImageUrl.url,
                    altText: baseImageUrl.altText
                } : null,
            }
        });
        
        const categoryMap = new Map<string, CategoryTreeNode>();
        const tree: CategoryTreeNode[] = [];

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            const node = categoryMap.get(cat.id)!;
            if (cat.parentId && categoryMap.has(cat.parentId)) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else if (cat.id === categoryId) {
                tree.push(node);
            }
        });

        return tree;
    }

    public handleGetList = async (query: CategoryListQuery) => {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;
        
        const categoryResult = await categoryRepository.findList({ skip, take });
        const total = await categoryRepository.count();
        
        const categories = categoryResult.map(cate => {
            const { categoryImages } = cate;
            const image = categoryImages.find(img => img.type === "IMAGE");

            return {
                id: cate.id,
                name: cate.name,
                slug: cate.slug,
                isActive: cate.isActive,
                parent: cate.parent ? {
                    id: cate.parent.id, 
                    name: cate.parent.name || ''
                } : null,
                imageUrl: image ?? null,
            }
        })

        const totalPages = Math.ceil(total / query.limit);

        return {
            categories,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalPages,
                totalItems: total,
                isPrevPage: query.page > 1,
                isNextPage: query.page < totalPages,
            },
        };
    }

    public categoriesOptions = async () => {
        const categoryResult = await categoryRepository.findList();

        return categoryResult.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug
        }))
    }

    public checkCategoryActive = async (categoryId: string): Promise<string> => {
        const category = await categoryRepository.findByID(categoryId);

        if (!category) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found.");
        }

        if (!category.isActive) {
            throw new AppError(409, "CONFLICT", "Cannot assign to inactive category.");
        }

        return category.slug;
    }


    private findDescendants = async (categoryId: string): Promise<Array<{ 
        id: string; 
        parentId: string | null; 
        slug: string 
    }>> => {
        const descendants: Array<{ 
            id: string; 
            parentId: string | null; 
            slug: string 
        }> = [];
        let queue: string[] = [categoryId];

        while (queue.length > 0) {
            const children = await categoryRepository.findDirectChildren(queue);
            
            if (children.length === 0) break;

            descendants.push(...children);
            queue = children.map(child => child.id);
        }

        return descendants;
    }
}

export const categoryService = new CategoryService();