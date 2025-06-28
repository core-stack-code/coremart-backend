import { NextFunction, Request, Response } from "express";
import { getProductListFilter, getProducts, getSortingAndPagnation } from "./products.service";
import { ProductListQuery } from "./products.schemas";
import { logger } from "../../utils/logger";
import { successResponse } from "../../utils/response";
import { getFavoritesFromProducts, ProductWithFav } from "../favorites/favorites.service";

export const getProfuctListController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const isGuest = false // will come from auth middleware
        const userId = 'some_user_id' // will going to come from auth middleware
        const query =  res.locals.query as ProductListQuery;

        const filters = getProductListFilter(query);
        const sortAndPage = getSortingAndPagnation(query);

        const { products, toal_products } = await getProducts(filters, sortAndPage)
        logger.info(products.length)

        let productsWithFav: ProductWithFav[];

        if (!isGuest) {
            productsWithFav = await getFavoritesFromProducts(products, userId);
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