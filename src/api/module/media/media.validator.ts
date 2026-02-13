import z from "zod";
import { Image_FORMATE, UPLOAD_CONFIGS, UPLOAD_CONFIGS_TYPES } from "./media.utils";

export const mediaSchema = z.object({
        mediaType: z.enum(UPLOAD_CONFIGS_TYPES, "Invalid upload type"),
        fileFormat: z.enum(Image_FORMATE, "Invalid file format"),
        fileSize: z.number(),
    }
).superRefine((data, ctx) => {
    const config = UPLOAD_CONFIGS[data.mediaType];

    if (data.fileSize > config.maxFileSize) {
        ctx.addIssue({
            code: "custom",
            message: `File size exceeds limit. Max allowed is ${config.maxFileSize / (1024 * 1024)} MB.`,
            path: ["fileSize"],
        });
    }
});

export type MediaPayload = z.infer<typeof mediaSchema>;