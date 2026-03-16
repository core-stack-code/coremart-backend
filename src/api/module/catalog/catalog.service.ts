import { Prisma } from "generated/prisma/browser";
import { catalogRepository, CategoryTreeNode, CategoryTreeItem, RawCategoryTreeItem } from "./catalog.repository";
import { ProductListQuery, ProductsByCategoryQuery } from "./catalog.validator";

import { ProductDetailApiResponse, ProductListApiResponse, ProductListResultItem, ProductVariantWithSKU } from "@core/types/product";
import { formatProductListItem, paiseToRupees } from "@core/utils/product.helper";
import { AppError } from "@api/utils/response";
import { favoritesRepository } from "@mod/favorites/favorites.repository";
import { favoritesService } from "@mod/favorites/favorites.service";
import { getRedisKeys } from "@core/utils/gerRedisKeys";
import { getRedisCache, setRedisCache } from "@core/lib/redis/cache";
import { getPaginationData } from "@core/utils/getPaginatoinData";
import { REDIS_TTL } from "@core/constants/redisTtl";


class CatalogService {
    public getProductDetail = async (productSlug: string, userId: string | null): Promise<ProductDetailApiResponse> => {
        // from cache
        const key = getRedisKeys('cache', 'products:details', productSlug)
        
        const cached = await getRedisCache<ProductDetailApiResponse>(key);
        if (cached) return cached;


        // form db
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
        
        let isFavorite = false;

        if (userId) {
            const favoriteProduct = await favoritesRepository.checkFavorite(userId, productResult.id);
            isFavorite = !!favoriteProduct;
        }

        const ratingBreakdown = await catalogRepository.getRatingBreakdown(productResult.id);
        
        const breakdown: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0 };
        ratingBreakdown.forEach(r => {
            breakdown[r.rating] = r._count.rating;
        });

        const responseData: ProductDetailApiResponse = {
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
                isFavorite,
            },
            categories: activeCategories,
            attributes: {
                sizes: Array.from(sizes),
                colors: Array.from(colors),
                materials: Array.from(materials),
            },
            variants,
            review: {
                averageRating: productResult.rating,
                totalReviews: productResult.totalReviews,
                breakdown: breakdown,
            }
        }
        
        // set to cache
        await setRedisCache(key, responseData, REDIS_TTL.PRODUCT_DETAIL);

        return responseData;
    }

    public getProducts = async (
        query: ProductListQuery,
        userId: string | null
    ) : Promise<ProductListApiResponse> => {
        // from cache
        const contexKey = JSON.stringify(query);
        const key = getRedisKeys('cache', 'products:list', contexKey);

        const cached = await getRedisCache<ProductListApiResponse>(key);
        if (cached) return cached;


        // from db
        const where = this.buildWhereForProductList(query);
        const orderBy = this.buildOrderByForProductList(query.sortBy);

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        let products: ProductListResultItem[] = await catalogRepository.findProducts({
            where,
            orderBy,
            skip,
            take,
        });

        // price-based sorting
        if (query.sortBy === "price_asc" || query.sortBy === "price_desc") {
            const direction = query.sortBy === "price_asc" ? "asc" : "desc";
            products = this.sortProductsByPrice(products, direction);
        }

        const total = await catalogRepository.countProducts(where);

        let favoriteSet = new Set<string>()

        if (userId) {
            const productIds = products.map(product => product.id);
            favoriteSet = await favoritesService.findFavoriteProducts(userId, productIds);
        }

        const formattedProducts = formatProductListItem(products, favoriteSet);
        const pagination = getPaginationData(query.page, query.limit, total);

        // set to cache
        await setRedisCache(key, {
            products: formattedProducts,
            pagination,
        }, REDIS_TTL.PRODUCT_LIST);

        return {
            products: formattedProducts,
            pagination,
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
        query: ProductsByCategoryQuery,
        userId: string | null
    ): Promise<ProductListApiResponse>  => {
        // from cache
        const context = JSON.stringify({ categorySlug, ...query });
        const key = getRedisKeys('cache', 'categories:products', context);

        const cached = await getRedisCache<ProductListApiResponse>(key);
        if (cached) return cached;


        // from db
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
            take,
        });

        if (query.sortBy === "price_asc" || query.sortBy === "price_desc") {
            const direction = query.sortBy === "price_asc" ? "asc" : "desc";
            products = this.sortProductsByPrice(products, direction);
        }

        const total = await catalogRepository.countProductsByCategory(category.id);

        let favoriteSet = new Set<string>()

        if (userId) {
            const productIds = products.map(product => product.id);
            favoriteSet = await favoritesService.findFavoriteProducts(userId, productIds);
        }

        const formattedProducts = formatProductListItem(products, favoriteSet);
        const pagination = getPaginationData(query.page, query.limit, total);

        // set to cache
        await setRedisCache(key, {
            products: formattedProducts,
            pagination,
        }, REDIS_TTL.PRODUCT_LIST);

        return {
            products: formattedProducts,
            pagination
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

    

    public checkActiveProduct = async (productId: string) => {
        const product = await catalogRepository.existActiveProduct(productId);
        
        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found.");
        }

        return product;
    }

    public getProductReviews = async (productSlug: string) => {
        const reviews = await catalogRepository.findProductReviews(productSlug);

        return reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            createdAt: review.createdAt,
            userName: review.user.name,
        }));
    }
}

export const catalogService = new CatalogService();