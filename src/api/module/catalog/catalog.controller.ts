import { Request, Response } from "express";
import { catalogService } from "./catalog.service";
import { ProductListQuery, ProductsByCategoryQuery } from "./catalog.validator";
import { AppResponse } from "@core/utils/response";


class CatalogController {
    public async getProductDetail(req: Request, res: Response) {
        const productSlug = req.params.productSlug as string;
        const userId = (req.user && !req.isGuest) ? req.user.id : null;

        const productDetail = await catalogService.getProductDetail(productSlug, userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product details fetched successfully",
            data: productDetail
        })
    }

    public async getProducts(req: Request, res: Response) {
        const query = req.localsQuery as ProductListQuery;
        const userId = (req.user && !req.isGuest) ? req.user.id : null;

        const result = await catalogService.getProducts(query, userId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Products fetched successfully",
            data: result
        })
    }

    public async getRootCategories(_req: Request, res: Response) {
        const categories = await catalogService.getRootCategories();

        AppResponse(res, 200, {
            code: "OK",
            message: "Root categories fetched successfully",
            data: categories
        })
    }

    public async getSubCategories(req: Request, res: Response) {
        const categorySlug = req.params.categorySlug;

        const categoryTrees = await catalogService.getSubCategoriesBySlug(categorySlug);

        AppResponse(res, 200, {
            code: "OK",
            message: "Sub categories fetched successfully",
            data: categoryTrees
        })
    }

    public async getProductsByCategory(req: Request, res: Response) {
        const categorySlug = req.params.categorySlug;
        const query = req.localsQuery as ProductsByCategoryQuery;
        const userId = (req.user && !req.isGuest) ? req.user.id : null;
        
        const result = await catalogService.getProductsByCategorySlug(
            categorySlug,
            query,
            userId
        );
        
        AppResponse(res, 200, {
            code: "OK",
            message: "Products fetched successfully",
            data: result
        })
    }

    public async getProductReviews(req: Request, res: Response) {
        const productSlug = req.params.productSlug;

        const reviews = await catalogService.getProductReviews(productSlug);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product reviews fetched successfully",
            data: reviews
        })
    }
}

export const catalogController = new CatalogController();