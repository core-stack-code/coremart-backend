import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { enrichProductList, getProductBySlug, getProductListFilter, getProducts, getRecentlyViewProducts, getSortingAndPagnation, getTrendingProducts } from "./products.service";
import { reviewListByProductId } from "../reviews/reviews.service";

import { ProductListQuery } from "./products.schemas";
import { ProductWithFav, SortAndPageType } from "./products.types";
import { AppResponse } from "@core/utils/response";
import { addViewToProduct } from "../product-view/productView.service";

class ProductController {

}

export const productController = new ProductController();





// ------------------------------------- Old code ---------------------------------- //

export const getProfuctListController = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const userId = ""
        const query =  res.locals.query as ProductListQuery;

        // get filters and sorting
        const filters = getProductListFilter(query);
        const sortAndPage = getSortingAndPagnation(query);

        // get data
        const { products, toal_products } = await getProducts(filters, sortAndPage, "description sizes")

        // check isFav and reduce images to one
        const productsWithFav = await enrichProductList(products, userId)

        AppResponse(res, 200, {
            code: "OK",
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
        const userId = ""

        // fecth product by slug
        const slug = req.params.slug;
        const product = await getProductBySlug(slug);
        
       await addViewToProduct(product._id, userId ? new Types.ObjectId(userId) : undefined);

        // check isFav
        const productWithFav = await enrichProductList(product, userId, false) as ProductWithFav;

        const reviews = await reviewListByProductId(product._id);

        AppResponse(res, 200, {
            code: "OK",
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


export const getNewArrivalProductsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = ""

        // default data for new arriavals
        const sortAndPage: SortAndPageType = {
            limit: 8,
            skip: 0,
            sort: { createdAt: -1 }
        }

        const { products } = await getProducts({}, sortAndPage, 'createdAt');

        // check isFav and reduce images to one
        const productsWithFav = await enrichProductList(products, userId)

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product list of new arriavals fetched successfully.',
            data: {
                products: productsWithFav,
            }
        });
    }
    catch (error) {
        next(error);
    }
}


export const getBestSellerProductsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = ""

        // default data for new arriavals
        const sortAndPage: SortAndPageType = {
            limit: 8    ,
            skip: 0,
            sort: { sold: -1 }
        }

        const { products } = await getProducts({}, sortAndPage, 'sold');

        // check isFav and reduce images to one
        const productsWithFav = await enrichProductList(products, userId)

         AppResponse(res, 200, {
            code: "OK",
            message: 'Product list of best seller fetched successfully.',
            data: {
                products: productsWithFav,
            }
        });
    }
    catch (error) {
        next(error);
    }
}

export const getTrandingProductsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = ""

        const products = await getTrendingProducts(8, 30)

        const productsWithFav = await enrichProductList(products, userId)

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product list of tranding fetched successfully.',
            data: {
                products: productsWithFav,
            }
        });
    }
    catch (error) {
        next(error);
    }
}


export const getRecentlyViewProductsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = ""
        const products = await getRecentlyViewProducts(userId, 8);

        const productsWithFav = await enrichProductList(products, userId)

        AppResponse(res, 200, {
            code: "OK",
            message: 'Product list of rencently view fetched successfully.',
            data: {
                products: productsWithFav,
            }
        });
    }
    catch (error) {
        next(error)
    }
}