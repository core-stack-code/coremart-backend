import { Response, Request } from "express";
import { analysisService } from "./analysis.service";
import { AppResponse } from "@core/utils/response";


class AnalysisController {
    public async getBrandAtrributeCount(_req: Request, res: Response) {
        const result = await analysisService.getBrandAtrributeCount()

        AppResponse(res, 200, {
            code: "OK",
            message: "Brands and atrributes count retrieved successfully",
            data: result
        })
    }

}

export const analysisController = new AnalysisController();