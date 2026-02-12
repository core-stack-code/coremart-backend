import { Request, Response } from "express";
import { catalogService } from "./catalog.service";
import { ProductListQuery, ProductsByCategoryQuery } from "./catalog.validator";

import { AppResponse } from "@core/utils/response";
import { log } from "@api/utils/log";


class CatalogController {
    public async getProductDetail(req: Request, res: Response) {
        const check = req.query
        log.info("query", check)

        const productSlug = req.params.productSlug as string;

        const productDetail = await catalogService.getProductDetail(productSlug);

        AppResponse(res, 200, {
            code: "OK",
            message: "Product details fetched successfully",
            data: productDetail
        })
    }

    public async getProducts(req: Request, res: Response) {
        const query = req.localsQuery as ProductListQuery;

        const result = await catalogService.getProducts(query);

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
        
        const result = await catalogService.getProductsByCategorySlug(
            categorySlug,
            query
        );
        
        AppResponse(res, 200, {
            code: "OK",
            message: "Products fetched successfully",
            data: result
        })
    }
}

export const catalogController = new CatalogController();