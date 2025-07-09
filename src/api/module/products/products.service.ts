import { Product, ProductLean } from "./products.modal";
import { ProductListQuery } from "./products.schemas";
import { PRODUCT_LIST_FIELDS } from "./products.contant";
import { ProductWithFav, SortAndPageType } from "./products.types";

import { getFavoritesFromProducts } from "../favorites/favorites.service";
import { CustomError } from "../../utils/response";
import { logger } from "../../utils/logger";
import { ProductView } from "../product-view/productView.modal";
import { Types } from "mongoose";


export const getProductListFilter = (query: ProductListQuery): Record<string, any> => {
    const filters: Record<string, any> = {};

    // price range filter
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
        filters.price = {};
        if (query.minPrice !== undefined) {
            filters.price.$gte = query.minPrice;
        }
        if (query.maxPrice !== undefined) {
            filters.price.$lte = query.maxPrice;
        }
    }

    // multi/single value filters
    if(query.brand) {
        filters.brand = { $in: query.brand };
    }
    if(query.size) {
        filters.sizes = { $in: query.size };
    }
    if(query.category) {
        filters.category = { $in: query.category };
    }
    if(query.type) {
        filters.dressType = { $in: query.type };
    }

    return filters;
}


export const getSortingAndPagnation = (query: ProductListQuery) => {
    const { page = 1, limit = 20, sortBy } = query;
    const skip = (page - 1) * limit;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
        rating: { rating: -1 },
        'price-ace': { price: 1 },
        'price-dce': { price: -1 },
        date: { createdAt: -1 },
    };

    const sort = sortMap[sortBy || ''] || { name: 1 };

    return { skip, limit, sort };
}


export const getProducts = async (filters: Record<string, any>, sortAndPage: SortAndPageType, fieldString: string = '') => {
    const { skip, limit, sort } = sortAndPage

    logger.info('filters:', filters);
    logger.info('sortAndPage:', sortAndPage);

    const [products, total] = await Promise.all([
        Product.find(filters)
            .select(`${PRODUCT_LIST_FIELDS} ${fieldString}`)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Product.countDocuments(filters),
    ]);

    if(products.length === 0) {
        throw new CustomError('No products found', 404);
    }

    return {
        products, 
        toal_products: total
    }
}


export const enrichProductList = async (
    products: ProductLean[] | ProductLean,
    userId?: string | null,
    trimImages: boolean = true
): Promise<ProductWithFav[] | ProductWithFav> => {

    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];

    const enriched = userId
        ? await getFavoritesFromProducts(productList, userId)
        : productList.map(p => ({ ...p, isFav: false }));

    const final = enriched.map(p => ({
        ...p,
        images: trimImages
        ? p.images?.length > 0
            ? [p.images[0]]
            : []
        : p.images ?? [],
    }));

    return isArray ? final : final[0];
};


export const getProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug }).lean();

    logger.info('product found:', product);

    if (!product) {
        throw new CustomError('Product not found', 400);
    }

    return product;
}


export const getTrendingProducts = async (limit: number = 8, days: number = 30) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const trendingProducts = await ProductView.aggregate([
        {
            $match: {
                viewedAt: { $gte: dateThreshold }
            }
        },
        {
            $group: {
                _id: "$productId",
                viewCount: { $sum: 1 }
            }
        },
        { $sort: { viewCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: '$product._id',
                name: '$product.name',
                slug: '$product.slug',
                brand: '$product.brand',
                price: '$product.price',
                category: '$product.category',
                dressType: '$product.dressType',
                images: '$product.images',
                viewCount: 1
            }
        }
    ]);

    return trendingProducts
}

export const getRecentlyViewProducts = async (userId: string, limit: number = 8) => {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - 30);

    const recentlyViewProducts = await ProductView.aggregate([
        {
            $match : {
                userId: new Types.ObjectId(userId),
                viewedAt: { $gte: dateThreshold },
            }
        },
        { $sort: { viewCount: -1 } },
        {
            $group: {
                _id: "$productId",
                viewedAt: { $first: "$viewedAt" }
            }
        },
        { $limit: limit },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $project: {
                _id: '$product._id',
                name: '$product.name',
                slug: '$product.slug',
                brand: '$product.brand',
                price: '$product.price',
                category: '$product.category',
                dressType: '$product.dressType',
                images: '$product.images',
                viewedAt: 1,
                userId: 1
            }
        }
    ])

    return recentlyViewProducts
}