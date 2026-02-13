import { Prisma } from "generated/prisma/browser";
import { catalogRepository, CategoryTreeNode, CategoryTreeItem, RawCategoryTreeItem } from "./catalog.repository";
import { ProductListQuery, ProductsByCategoryQuery } from "./catalog.validator";

import { paiseToRupees } from "@mod/variants/variants.utils";
import { PaginationType } from "@core/types/common";
import { AppError } from "@core/utils/response";

type ProductVariantWithSKU = {
    size: string;
    color: string;
    material: string;
    price: number;
    imageUrl: string | null;
    inStock: boolean;
}

type ProductListResultItem = {
    id: string;
    name: string;
    slug: string;
    description: string;
    brand: { name: string; slug: string } | null;
    variants: Array<{ sku: { price: number } | null }>;
    productImages: Array<{ url: string; altText: string | null }>;
}

type ProductListItem = {
    id: string;
    name: string;
    slug: string;
    brand: {
        name: string;
        slug: string;
    } | null;
    description: string;
    thumbnail: {
        url: string;
        altText: string | null;
    };
    price: number | null;
}


class CatalogService {
    public getProductDetail = async (productSlug: string) => {
        const productResult = await catalogRepository.findProductBySlug(productSlug);

        if (!productResult) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }

        const activeCategories = productResult.productCategories
            .filter(c => c.category.isActive)
            .map(c => ({
                name: c.category.name, 
                slug: c.category.slug
            }));

        const sizes = new Set<string>();
        const colors = new Set<string>();
        const materials = new Set<string>();

        const variants: ProductVariantWithSKU[] = productResult.variants
            .filter(vari => vari.sku && vari.sku.isActive)
            .map(v => {
                sizes.add(v.size.name);
                colors.add(v.color.name);
                materials.add(v.material.name);

                return {
                    size: v.size.name,
                    color: v.color.name,
                    material: v.material.name,
                    price: paiseToRupees(v.sku!.price),
                    imageUrl: v.imageUrl,
                    inStock: v.sku!.stock > 0,
                }
            })
        
        const thumbnailImage = productResult.productImages.find(img => img.type === "THUMBNAIL");
        const images = productResult.productImages
            .filter(img => img.type === "GALLERY")
            .map(img => ({
                url: img.url,
                altText: img.altText,
            }));

        return {
            product: {
                name: productResult.name,
                slug: productResult.slug,
                description: productResult.description,
                brand: {
                    name: productResult.brand?.name ?? null,
                    slug: productResult.brand?.slug ?? null,
                    logoUrl: productResult.brand?.logoUrl ?? null,
                },
                thumbnailImage: thumbnailImage ? {
                    url: thumbnailImage.url,
                    altText: thumbnailImage.altText,
                } : null,
                images,
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

    public getProducts = async (
        query: ProductListQuery
    ) : Promise<{ products: ProductListItem[], pagination: PaginationType }> => {

        const where = this.buildWhereForProductList(query);
        const orderBy = this.buildOrderByForProductList(query.sortBy);

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        let products: ProductListResultItem[] = await catalogRepository.findProducts({
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

        const formattedProducts = this.formateProductListItem(products);
        const totalPages = Math.ceil(total / query.limit);


        return {
            products: formattedProducts,
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

    public getRootCategories = async () => {
        const result = await catalogRepository.findRootCategories();

        return result.map(cat => {
            const { categoryImages, ...rest } = cat;
            return {
                ...rest,
                image: categoryImages.length > 0 ? categoryImages[0].url : null,
            }
        });
    }

    public getSubCategoriesBySlug = async (slug: string): Promise<CategoryTreeNode | undefined> => {
        const rootCategory = await catalogRepository.findCategoryBySlug(slug);

        if (!rootCategory) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found");
        }

        const rawCategories: RawCategoryTreeItem[] = await catalogRepository.findAllActiveCategories();

        const categories: CategoryTreeItem[] = rawCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parentId: cat.parentId,
            imageUrl: cat.categoryImages.length > 0 ? cat.categoryImages[0].url : null,
        }));

        const categoryMap = new Map<string, CategoryTreeNode>();

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

        return subtree
    }

    public getProductsByCategorySlug= async (
        categorySlug: string,
        query: ProductsByCategoryQuery
    ): Promise<{ products: ProductListItem[], pagination: PaginationType }>  => {
        const category = await catalogRepository.findCategoryBySlug(categorySlug);

        if (!category) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Category not found");
        }

        const orderBy = this.buildOrderByForProductList(query.sortBy);

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        let products: ProductListResultItem[] = await catalogRepository.productListByCategory({
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

        const formattedProducts = this.formateProductListItem(products);
        const totalPages = Math.ceil(total / query.limit);


        return {
            products: formattedProducts,
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

    private buildOrderByForProductList = (
        sortBy: ProductListQuery["sortBy"]
    ): Prisma.ProductOrderByWithRelationInput  => {
        
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

    private sortProductsByPrice = (products: ProductListResultItem[], direction: "asc" | "desc") => {
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

    private formateProductListItem = (products: ProductListResultItem[]): ProductListItem[] => {
        return products.map((p) => {
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
                thumbnail: p.productImages[0] ?? null,
                price,
            };
        });
    }
}

export const catalogService = new CatalogService();