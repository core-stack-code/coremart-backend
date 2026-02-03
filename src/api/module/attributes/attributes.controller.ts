import { Request, Response } from "express";
import { ColorAttributeInput, MaterialAttributeInput, SizeAttributeInput } from "./attributes.validator";
import { attributesService } from "./attributes.service";
import { AppResponse } from "@core/utils/response";


class AttributesController {
    public async getSizeList(req: Request, res: Response) {
        const sizes = await attributesService.handleSizeList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Size list fetched successfully",
            data: sizes,
        });
    }

    public async getColorList(req: Request, res: Response) {
        const colors = await attributesService.handleColorList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Color list fetched successfully",
            data: colors,
        });
    }

    public async getMaterialList(req: Request, res: Response) {
        const materials = await attributesService.handleMaterialList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Material list fetched successfully",
            data: materials,
        });
    }

    public async getAttibutes(req: Request, res: Response) {
        const result = await attributesService.handleAttributeList();

        AppResponse(res, 200, {
            code: "OK",
            message: "Attributes fetched successfully",
            data: result,
        });
    }

    public async createSize(req: Request, res: Response) {
        const payload = req.body as SizeAttributeInput;

        const size = await attributesService.handleCreateSize(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Size created successfully",
            data: size,
        });
    }

    public async updateSize(req: Request, res: Response) {
        const sizeId = req.params.id;
        const payload = req.body as SizeAttributeInput;

        const size = await attributesService.handleUpdateSize(sizeId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Size updated successfully",
            data: size,
        });
    }

    public async deactivateSize(req: Request, res: Response) {
        const sizeId = req.params.id;

        const size = await attributesService.handleDeactivateSize(sizeId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Size deactivated successfully",
            data: size,
        });
    }

    public async createColor(req: Request, res: Response) {
        const payload = req.body as ColorAttributeInput;

        const color = await attributesService.handleCreateColor(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Color created successfully",
            data: color,
        });
    }

    public async updateColor(req: Request, res: Response) {
        const colorId = req.params.id;
        const payload = req.body as ColorAttributeInput;

        const color = await attributesService.handleUpdateColor(colorId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Color updated successfully",
            data: color,
        });
    }

    public async deactivateColor(req: Request, res: Response) {
        const colorId = req.params.id;

        const color = await attributesService.handleDeactivateColor(colorId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Color deactivated successfully",
            data: color,
        });
    }

    public async createMaterial(req: Request, res: Response) {
        const payload = req.body as MaterialAttributeInput;

        const material = await attributesService.handleCreateMaterial(payload);

        AppResponse(res, 201, {
            code: "CREATED",
            message: "Material created successfully",
            data: material,
        });
    }

    public async updateMaterial(req: Request, res: Response) {
        const materialId = req.params.id;
        const payload = req.body as MaterialAttributeInput;

        const material = await attributesService.handleUpdateMaterial(materialId, payload);

        AppResponse(res, 200, {
            code: "OK",
            message: "Material updated successfully",
            data: material,
        });
    }

    public async deactivateMaterial(req: Request, res: Response) {
        const materialId = req.params.id;

        const material = await attributesService.handleDeactivateMaterial(materialId);

        AppResponse(res, 200, {
            code: "OK",
            message: "Material deactivated successfully",
            data: material,
        });
    }
}

export const attributesController = new AttributesController();