import { Response, Request } from "express";
import { analysisService } from "./analysis.service";
import { AppResponse } from "@core/utils/response";
import { RevenueAnalysisQuery, StatusAnalysisQuery } from "./analysis.validator";


class AnalysisController {
    public async getOverviewMatrix(_req: Request, res: Response) {
        const result = await analysisService.getOverviewMatrix()

        AppResponse(res, 200, {
            code: "OK",
            message: "Overview matrix retrieved successfully",
            data: result
        })
    }

    public async getRevenueAnalysis(req: Request, res: Response) {
        const query = req.localsQuery as RevenueAnalysisQuery;

        const result = await analysisService.getRevenueAnalysis(query)

        AppResponse(res, 200, {
            code: "OK",
            message: "Revenue analysis retrieved successfully",
            data: result
        })
    }

    public async getStatusAnalysis(req: Request, res: Response) {
        const query = req.localsQuery as StatusAnalysisQuery;

        const result = await analysisService.getStatusAnalysis(query)

        AppResponse(res, 200, {
            code: "OK",
            message: "Status analysis retrieved successfully",
            data: result
        })
    }

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