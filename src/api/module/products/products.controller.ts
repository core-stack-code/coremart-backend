import { NextFunction, Request, Response } from "express";
import { getProductListFilter, getProducts, getSortingAndPagnation } from "./products.service";
import { ProductListQuery } from "./products.schemas";
import { logger } from "../../utils/logger";
import { successResponse } from "../../utils/response";
import { getFavoritesFromProducts, ProductWithFav } from "../favorites/favorites.service";
import { assertAuth } from "../../utils/assertAuth";

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
        logger.info('products.length', products.length)

        let productsWithFav: ProductWithFav[];

        if (userId) {
            productsWithFav = await getFavoritesFromProducts(products,  userId);
        } else {
            productsWithFav = products.map((p) => ({
                ...p,
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