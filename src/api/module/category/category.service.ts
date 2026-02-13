import { prisma } from "@core/config/prisma";
import { CategoryImageInput, CategoryListItem, CategoryTreeNode, categoryRepository, CategoryTreeItem } from "./category.repository";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./category.validator";
import { AppError } from "@core/utils/response";
import { slugify } from "@core/utils/db.helper";


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
                descendants = await categoryRepository.findDescendants(id);

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
        });
    }

    public handleGetTree = async (): Promise<CategoryTreeNode[]> => {
        const categoryResult = await categoryRepository.findAll();
        
        const categories: CategoryTreeItem[] = categoryResult.map(cat => {
            const { categoryImages, ...rest } = cat;
            
            return {
                ...rest,
                imageUrl: categoryImages.length > 0 ? categoryImages[0] : null,
            }
        });
        
        const categoryMap = new Map<string, CategoryTreeNode>();
        const tree: CategoryTreeNode[] = [];

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            const node = categoryMap.get(cat.id)!;
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                if (parent) {
                    parent.children.push(node);
                }
            } else {
                tree.push(node);
            }
        });

        return tree;
    }

    public handleGetList = async () => {
        const categoryResult = await categoryRepository.findList();
        
        const categories = categoryResult.map(cate => {
            const { categoryImages, ...rest } = cate;
            const banner = categoryImages.find(img => img.type === "BANNER");
            const image = categoryImages.find(img => img.type === "IMAGE");

            return {
                ...rest,
                bannerImageUrl: banner ?? null,
                imageUrl: image ?? null,
            }
        })

        return categories;
    }

    public handleToggleActive = async (id: string) => {
        const category = await categoryRepository.findUnique(id);

        if (!category) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found.");
        }

        await categoryRepository.toggleActive(id, !category.isActive);
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
}

export const categoryService = new CategoryService();