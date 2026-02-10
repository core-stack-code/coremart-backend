import { prisma } from "@core/config/prisma";
import { CategoryListItem, categoryRepository } from "./category.repository";
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

        await categoryRepository.create({
            name: payload.name,
            parentId: payload.parentId,
            slug,
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

    public handleGetTree = async () => {
        const categories = await categoryRepository.findAll();
        
        const categoryMap = new Map();
        const tree: CategoryListItem[] = [];

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        categories.forEach(cat => {
            const node = categoryMap.get(cat.id);
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
        return await categoryRepository.findList();
    }

    public handleToggleActive = async (id: string) => {
        const category = await categoryRepository.findUnique(id);

        if (!category) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found.");
        }

        await categoryRepository.toggleActive(id, category.isActive);
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