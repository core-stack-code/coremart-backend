import { NextFunction, Request, Response } from "express";
import { getProductBySlug, getProductListFilter, getProducts, getSortingAndPagnation } from "./products.service";
import { ProductListQuery } from "./products.schemas";
import { logger } from "../../utils/logger";
import { successResponse } from "../../utils/response";
import { getFavoritesByProductId, getFavoritesFromProducts, ProductWithFav } from "../favorites/favorites.service";
import { reviewListByProductId } from "../reviews/reviews.service";
import { Types } from "mongoose";

export const getProfuctListController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const userId = req.auth?.isGuest ? null : req.auth?.userId;
        const query =  res.locals.query as ProductListQuery;
        logger.info('checking in product list api', userId);

        // get filters and sorting
        const filters = getProductListFilter(query);
        const sortAndPage = getSortingAndPagnation(query);

        // get data
        const { products, toal_products } = await getProducts(filters, sortAndPage)
        logger.info('products', products[0].slug)

        let productsWithFav: ProductWithFav[];

        if (userId) {
            productsWithFav = (await getFavoritesFromProducts(products,  userId)).map((p) => {
                return {
                    ...p,
                    images: [p.images[0]],
                }
            })
        } else {
            productsWithFav = products.map((p) => ({
                ...p,
                images: [p.images[0]],
                isFav: false,
            }));
        }

        successResponse(res, {
            status: 200,
            message: 'Product list fetched successfully.',
            data: {
                products: productsWithFav,
                toal_products,
            }
        });
    }
    catch (error) {
        next(error)
    }
}

export const getProductController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.auth?.isGuest ? null : req.auth?.userId;

        const slug = req.params.slug;
        logger.info('product slug:', slug);

        const product = await getProductBySlug(slug);
        let productWithFav: ProductWithFav

        if(userId) {
            const isFav = await getFavoritesByProductId(product._id, new Types.ObjectId(userId));
            productWithFav = {
                ...product,
                isFav,
            };
        }
        else {
            productWithFav = {
                ...product,
                isFav: false,
            };
        }

        logger.info('product with fav:', productWithFav);
        const reviews = await reviewListByProductId(product._id);

        successResponse(res, {
            status: 200,
            message: 'Product fetched successfully.',
            data: {
                reviews,
                product: {
                    ...productWithFav,
                    numReviews: reviews.length === 0 ? 0 : productWithFav.numReviews,
                    rating: reviews.length === 0 ? 0 : productWithFav.rating,
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
}