import { Request, Response } from "express";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./category.validator";
import { categoryService } from "./category.service";
import { AppResponse } from "@core/utils/response";


class CategoryController {
    public async createCategory(req: Request, res: Response) {
        const payload = req.body as CreateCategoryPayload;

        await categoryService.handleCreate(payload);

        AppResponse(res, 201, {
            code: "OK",
            message: "Category created successfully.",
        }); 
    }

    public async updateCategory(req: Request, res: Response) {
        const { id } = req.params;
        const payload = req.body as UpdateCategoryPayload;

        await categoryService.handleUpdate(id, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Category updated successfully.",
        });
    }

    public async getCategoryTree(_req: Request, res: Response) {
        const tree = await categoryService.handleGetTree();

        AppResponse(res, 200, {
            code: "OK",
            message: "Category tree fetched successfully.",
            data: tree,
        });
    }

    public async getCategoryList(_req: Request, res: Response) {
        const categories = await categoryService.handleGetList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Categories fetched successfully.",
            data: categories,
        });
    }

    public async getCategoriesOptions(_req: Request, res: Response) {
        const categories = await categoryService.categoriesOptions();

        AppResponse(res, 200, {
            code: "OK",
            message: "Categories fetched successfully.",
            data: categories,
        });
    }
}

export const categoryController = new CategoryController();