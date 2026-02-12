import { Prisma } from "generated/prisma/browser";
import { catalogRepository } from "./catalog.repository";
import { ProductListQuery, ProductsByCategoryQuery } from "./catalog.validator";

import { paiseToRupees } from "@mod/variants/variants.utils";
import { AppError } from "@core/utils/response";
import { PaginationType } from "@core/types/common";

type ProductVariantWithSKU = {
    size: string;
    color: string;
    material: string;
    price: number;
    inStock: boolean;
}

type ProductListItem = {
    id: string;
    name: string;
    slug: string;
    description: string;
    brand: { name: string; slug: string } | null;
    variants: Array<{ sku: { price: number } | null }>;
}


class CatalogService {
    public getProductDetail = async (productSlug: string) => {
        const product = await catalogRepository.findProductBySlug(productSlug);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }
        
        const categories = await catalogRepository.findCategoriesByProductId(product.id);

        const activeCategories = categories
            .filter(c => c.category.isActive)
            .map(c => ({
                name: c.category.name, 
                slug: c.category.slug
            }));

        const rows = await catalogRepository.findProductVariantsByProductId(product.id);

        const sizes = new Set<string>();
        const colors = new Set<string>();
        const materials = new Set<string>();

        const variants: ProductVariantWithSKU[] = rows
            .filter(row => row.sku && row.sku.isActive)
            .map(r => {
                sizes.add(r.size.name);
                colors.add(r.color.name);
                materials.add(r.material.name);

                return {
                    size: r.size.name,
                    color: r.color.name,
                    material: r.material.name,
                    price: paiseToRupees(r.sku!.price),
                    inStock: r.sku!.stock > 0,
                }
            })

        return {
            product: {
                name: product.name,
                slug: product.slug,
                description: product.description,
                brand: product.brand,
            },
            categories: activeCategories,
            attributes: {
                sizes: Array.from(sizes),
                colors: Array.from(colors),
                materials: Array.from(materials),
            },
            variants,
        };
    }

    public getProducts = async (query: ProductListQuery) => {
        const where = this.buildWhereForProductList(query);
        const orderBy = this.buildOrderByForProductList(query.sortBy);

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        let products: ProductListItem[] = await catalogRepository.findProducts({
            where,
            orderBy,
            skip,
            take
        });

        // price-based sorting
        if (query.sortBy === "price_asc" || query.sortBy === "price_desc") {
            const direction = query.sortBy === "price_asc" ? "asc" : "desc";
            products = this.sortProductsByPrice(products, direction);
        }

        const total = await catalogRepository.countProducts(where);

        const formatted = products.map((p) => {
            const prices = p.variants
                .map((v) => v.sku?.price)
                .filter((price): price is number => typeof price === "number");

            const price = prices.length ? paiseToRupees(Math.min(...prices)) : null;

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                brand: p.brand,
                description: p.description,
                price,
            };
        });

        const totalPages = Math.ceil(total / query.limit);
        const pagination: PaginationType = {
            page: query.page,
            limit: query.limit,
            totalPages,
            totalItems: total,
            isPrevPage: query.page > 1,
            isNextPage: query.page < totalPages,
        };

        return {
            products: formatted,
            pagination,
        };
    }

    public getRootCategories = async () => {
        return await catalogRepository.findRootCategories();
    }

    public getSubCategoriesBySlug = async (slug: string) => {
        const rootCategory = await catalogRepository.findCategoryBySlug(slug);

        if (!rootCategory) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found");
        }

        const categories = await catalogRepository.findAllActiveCategories();

        const categoryMap = new Map<string, any>();

        categories.forEach(cat => {
            categoryMap.set(cat.id, { ...cat, children: [] });
        });

        // link parent to children
        categories.forEach(cat => {
            if (cat.parentId) {
                const parent = categoryMap.get(cat.parentId);
                const node = categoryMap.get(cat.id);

                if (parent && node) {
                    parent.children.push(node);
                }
            }
        });

        const subtree = categoryMap.get(rootCategory.id);

        return subtree;
    }

    public getProductsByCategorySlug= async (categorySlug: string, query: ProductsByCategoryQuery) => {
        const category = await catalogRepository.findCategoryBySlug(categorySlug);

        if (!category) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found");
        }

        const orderBy = this.buildOrderByForProductList(query.sortBy);

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        let products: ProductListItem[] = await catalogRepository.productListByCategory({
            categoryId: category.id,
            orderBy,
            skip,
            take
        });

        if (query.sortBy === "price_asc" || query.sortBy === "price_desc") {
            const direction = query.sortBy === "price_asc" ? "asc" : "desc";
            products = this.sortProductsByPrice(products, direction);
        }

        const total = await catalogRepository.countProductsByCategory(category.id);

        const formatted = products.map((p) => {
            const prices = p.variants
                .map((v) => v.sku?.price)
                .filter((price): price is number => typeof price === "number");

            const price = prices.length ? paiseToRupees(Math.min(...prices)) : null;

            return {
                id: p.id,
                name: p.name,
                slug: p.slug,
                brand: p.brand,
                description: p.description,
                price,
            };
        });

        const totalPages = Math.ceil(total / query.limit);
        const pagination: PaginationType = {
            page: query.page,
            limit: query.limit,
            totalPages,
            totalItems: total,
            isPrevPage: query.page > 1,
            isNextPage: query.page < totalPages,
        };

        return {
            products: formatted,
            pagination,
        };
    }



    private buildWhereForProductList = (query: ProductListQuery): Prisma.ProductWhereInput => {
        const productWhere: Prisma.ProductWhereInput = {
            status: "ACTIVE",
        };

        // brand
        if (query.brand?.length) {
            productWhere.brand = {
                slug: { in: query.brand },
                isActive: true,
            };
        }

        // search
        if (query.search) {
            productWhere.name = {
                contains: query.search,
                mode: "insensitive",
            };
        }

        const skuWhere: Prisma.SKUWhereInput = {
            isActive: true,
        };

        // price range
        if (query.minPrice !== undefined || query.maxPrice !== undefined) {
            skuWhere.price = {
                gte: query.minPrice ? query.minPrice * 100 : undefined,
                lte: query.maxPrice ? query.maxPrice * 100 : undefined,
            };
        }

        const variantWhere: Prisma.VariantWhereInput = {};

        // size
        if (query.size?.length) {
            variantWhere.size = {
                name: { in: query.size },
                isActive: true,
            };
        }

        // color
        if (query.color?.length) {
            variantWhere.color = {
                name: { in: query.color },
                isActive: true,
            };
        }

        // material
        if (query.material?.length) {
            variantWhere.material = {
                name: { in: query.material },
                isActive: true,
            };
        }

        productWhere.variants = {
            some: {
                ...variantWhere,
                sku: {
                    is: skuWhere,
                },
            },
        };

        return productWhere;
    }

    private buildOrderByForProductList = (sortBy: ProductListQuery["sortBy"]): Prisma.ProductOrderByWithRelationInput  => {
        if (sortBy === "alphabetical") {
            return { name: "asc" };
        }
        else if (sortBy === "newest") {
            return { createdAt: "desc" };
        }
        else if (sortBy === "price_asc" || sortBy === "price_desc") {
            // price sorting handled at service
            return { createdAt: "desc" };
        }
        else {
            return { createdAt: "desc" };
        }
    }

    private sortProductsByPrice = (products: ProductListItem[], direction: "asc" | "desc") => {
        return products.sort((a, b) => {
            const aPrices = a.variants
                .map((v) => v.sku?.price)
                .filter((price): price is number => typeof price === "number");
            const bPrices = b.variants
                .map((v) => v.sku?.price)
                .filter((price): price is number => typeof price === "number");

            const aMinPrice = aPrices.length ? Math.min(...aPrices) : Infinity;
            const bMinPrice = bPrices.length ? Math.min(...bPrices) : Infinity;

            return direction === "asc" ? aMinPrice - bMinPrice : bMinPrice - aMinPrice;
        });
    }
}

export const catalogService = new CatalogService();