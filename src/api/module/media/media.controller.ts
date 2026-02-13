import { Request, Response } from "express";
import { mediaService } from "./media.service";
import { MediaPayload } from "./media.validator";
import { AppResponse } from "@core/utils/response";


class MediaController {
    public async generateSignature(req: Request, res: Response) {
        const payload = req.body as MediaPayload;

        const result = await mediaService.handleSignatureRequest(payload.mediaType);

        AppResponse(res, 200, {
            code: "OK",
            message: "Signature generated successfully",
            data: result,
        })
    }
}

export const mediaController = new MediaController();