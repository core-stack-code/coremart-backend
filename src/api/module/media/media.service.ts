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

        const signatureData = await this.generateSignature(config.folderPath);

        return {
            timestamp: signatureData.timestamp,
            signature: signatureData.signature,
            cloud_name: env.CLOUDINARY_CLOUD_NAME,
            api_key: env.CLOUDINARY_API_KEY,
            folder: signatureData.folder,
        }
    }

    private async generateSignature(folderPath: string) {
        const timestamp = Math.round(new Date().getTime() / 1000);

        const signatureParams = { 
            timestamp, 
            folder: folderPath,
        };

        const signature = cloudinary.utils.api_sign_request(
            signatureParams,
            env.CLOUDINARY_API_SECRET
        );

        return { signature, ...signatureParams };
    }
}

export const mediaService = new MediaService();