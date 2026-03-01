import { v2 as cloudinary } from 'cloudinary';
import { env } from '@core/config/env';
import { UPLOAD_CONFIGS, UploadConfigType } from './media.utils';

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});


class MediaService {
    public async handleSignatureRequest(mediaType: UploadConfigType) {
        const config = UPLOAD_CONFIGS[mediaType];

        const signatureData = await this.generateSignature(
            config.folderPath,
            config.transformation
        );

        return {
            timestamp: signatureData.timestamp,
            signature: signatureData.signature,
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            folder: signatureData.folder,
            transformation: signatureData.transformation,
        }
    }

    private async generateSignature(folderPath: string, transformation: {
        width: number;
        height: number;
        crop: string;
    }) {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const transformationString = `w_${transformation.width},h_${transformation.height},c_${transformation.crop},q_auto,f_auto`;

        const signatureParams = { 
            timestamp, 
            folder: `coremart/${folderPath}`,
            transformation: transformationString,
        };

        const signature = cloudinary.utils.api_sign_request(
            signatureParams,
            env.CLOUDINARY_API_SECRET
        );

        return { signature, ...signatureParams };
    }
}

export const mediaService = new MediaService();