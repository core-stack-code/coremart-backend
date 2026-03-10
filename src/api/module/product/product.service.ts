import { prisma } from "@core/config/prisma";
import { CreateProductPayload, ProductListQuery, UpdateProductPayload } from "./product.validator";
import { ProductInput, productRepository, ProductResultItem } from "./product.repository";

import { deleteRedisCacheByPattern, deleteRedisCache } from "@core/lib/redis/cache";
import { getRedisKeys } from "@core/utils/gerRedisKeys";
import { ProductDetailItem, ProductsItem } from "@core/types/product";
import { AppError } from "@core/utils/response";
import { slugify } from "@core/utils/db.helper";
import { PaginationType } from "@core/types/common";
import { log } from "@api/utils/log";


class ProductService {
    public handleCreate = async (payload: CreateProductPayload) => {
        await prisma.$transaction(async (tx) => {
            const product = await productRepository.create({
                name: payload.name,
                description: payload.description,
                slug: slugify(payload.name),
            }, tx);

            const images: ProductInput[] = [];

            if (payload.thumbnailUrl) {
                images.push({
                    url: payload.thumbnailUrl.url,
                    altText: payload.thumbnailUrl.altText,
                    type: "THUMBNAIL",
                });
            }

            if (payload.imageGalary && payload.imageGalary.length > 0) {
                payload.imageGalary.forEach((img) => {
                    images.push({
                        url: img.url,
                        altText: img.altText,
                        type: "GALLERY",
                    });
                });
            }

            if (images.length > 0) {
                await productRepository.addImages(product.id, images, tx);
            }

            await deleteRedisCacheByPattern(getRedisKeys('cache', 'products:list', '*'));
            await deleteRedisCacheByPattern(getRedisKeys('cache', 'categories:products', '*'));
        });
    }

    public handleUpdate = async (id: string, payload: UpdateProductPayload) => {
        await prisma.$transaction(async (tx) => {
            const product = await productRepository.update(id, {
                name: payload.name,
                description: payload.description,
                status: payload.status,
                slug: payload.name ? slugify(payload.name) : undefined,
            }, tx);

            const images: ProductInput[] = [];

            if (payload.thumbnailUrl !== undefined) {
                await productRepository.deleteImages(product.id, "THUMBNAIL", tx)

                if (payload.thumbnailUrl) {
                    images.push({
                        url: payload.thumbnailUrl.url,
                        altText: payload.thumbnailUrl.altText,
                        type: "THUMBNAIL",
                    });
                }
            }

            if (payload.imageGalary !== undefined) {
                await productRepository.deleteImages(product.id, "GALLERY", tx)

                if (payload.imageGalary.length > 0) {
                    payload.imageGalary.forEach((img) => {
                        images.push({
                            url: img.url,
                            altText: img.altText,
                            type: "GALLERY",
                        });
                    });
                }
            }

            if (images.length > 0) {
                await productRepository.addImages(product.id, images, tx);
            }

            await deleteRedisCacheByPattern(getRedisKeys('cache', 'products:list', '*'));
            await deleteRedisCacheByPattern(getRedisKeys('cache', 'categories:products', '*'));
            await deleteRedisCache(getRedisKeys('cache', 'products:list', id))
        });
    }

    public getProductList = async (query: ProductListQuery): Promise<{
        products: ProductsItem[],
        pagination: PaginationType
    }> => {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const productsResult = await productRepository.getList(skip, take);
        const total = await productRepository.count();

        log.info("productsResult", productsResult);
        // name, status, thumbnailUrl, updatedAt, brand, number of variants

        const totalPages = Math.ceil(total / query.limit);
        
        const products = this.productsMaping(productsResult);

        return {
            products,
            pagination: {
                page: query.page,
                limit: query.limit,
                totalPages,
                totalItems: total,
                isPrevPage: query.page > 1,
                isNextPage: query.page < totalPages,
            }
        }
    }

    public getProduct = async (productId: string): Promise<ProductDetailItem> => {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }

        const { productImages, productCategories, variants, ...rest } = product;
        const thumbnail = productImages.find(img => img.type === "THUMBNAIL");
        const images = productImages.filter(img => img.type === "GALLERY");

        const variantsWithSku: ProductDetailItem['variants'] = variants.map(v => {
            return {
                id: v.id,
                color: v.color.name,
                size: v.size.name,
                material: v.material.name,
                imageUrl: v.imageUrl || null,
                sku: v.sku ? {
                    id: v.sku.id,
                    skuCode: v.sku.skuCode,
                    stock: v.sku.stock,
                    price: v.sku.price,
                    isActive: v.sku.isActive
                } : null
            };
        });

        const categories: ProductDetailItem['categories'] = productCategories.map(pc => ({
            name: pc.category.name,
            id: pc.category.id
        }));


        return {
            ...rest,
            thumbnail: thumbnail ? {
                url: thumbnail.url,
                altText: thumbnail.altText,
                createdAt: thumbnail.createdAt
            } : null,
            images: images.map(img => ({
                url: img.url,
                altText: img.altText,
                createdAt: img.createdAt
            })),
            categories,
            variants: variantsWithSku
        };
    }

    private productsMaping = (products: ProductResultItem[]): ProductsItem[] => {
        return products.map(prod => {
            const { productImages, _count, brand, ...rest } = prod;
            const thumbnail = productImages.find(img => img.type === "THUMBNAIL")

            return {
                ...rest,
                thumbnail: thumbnail ? {
                    url: thumbnail.url,
                    altText: thumbnail.altText
                } : null,
                variantsCount: _count.variants,
                brand: brand ? {
                    name: brand.name,
                    id: brand.id
                } : null,
            }
        })
    }
}

export const productService = new ProductService();