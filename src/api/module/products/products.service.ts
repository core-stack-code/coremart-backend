import { RecordType } from "zod";
import { ProductListQuery } from "./products.schemas";
import { Product } from "./products.modal";
import { PRODUCT_LIST_FIELDS } from "./products.contant";
import { CustomError } from "../../utils/response";
import { logger } from "../../utils/logger";

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

type SortAndPageType = {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
}

export const getProducts = async (filters: Record<string, any>, sortAndPage: SortAndPageType) => {
    const { skip, limit, sort } = sortAndPage

    const [products, total] = await Promise.all([
        Product.find(filters).select(PRODUCT_LIST_FIELDS).sort(sort).skip(skip).limit(limit).lean(),
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

export const getProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug }).lean();

    logger.info('product found:', product);

    if (!product) {
        throw new CustomError('Product not found', 400);
    }

    return product;
}