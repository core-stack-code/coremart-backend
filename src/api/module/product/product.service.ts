import { prisma } from "@core/config/prisma";
import { CreateProductPayload, ProductListQuery, UpdateProductPayload } from "./product.validator";
import { ProductInput, productRepository, ProductResultItem } from "./product.repository";

import { AppError } from "@core/utils/response";
import { slugify } from "@core/utils/db.helper";
import { PaginationType } from "@core/types/common";

type ImageItm = ProductResultItem["productImages"][number];

type ProductItem = Omit<ProductResultItem, "productImages"> & {
    thumbnail: ImageItm | null,
    images: ImageItm[],
}


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
        });
    }

    public getProductList = async (query: ProductListQuery): Promise<{
        products: ProductItem[],
        pagination: PaginationType
    }> => {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const productsResult = await productRepository.getList(skip, take);
        const  total = await productRepository.count();

        const products = this.productImageMaping(productsResult);
        const totalPages = Math.ceil(total / query.limit);

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

    public getProduct = async (productId: string): Promise<ProductItem> => {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }

        const result = this.productImageMaping([product]);
        const { thumbnail, images, ...rest } = result[0];

        return {
            ...rest,
            images,
            thumbnail
        };
    }

    private productImageMaping = (products: ProductResultItem[]): ProductItem[] => {
        return products.map(prod => {
            const { productImages, ...rest } = prod;
            const thumbnail = productImages.find(img => img.type === "THUMBNAIL")
            const images = productImages.filter(img => img.type === "GALLERY")

            return {
                ...rest,
                images,
                thumbnail: thumbnail ?? null,
            }
        })
    }
}

export const productService = new ProductService();