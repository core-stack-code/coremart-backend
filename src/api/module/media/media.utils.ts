
export const Image_FORMATE = ['jpg', 'jpeg', 'png', 'webp'] as const;

export const UPLOAD_CONFIGS_TYPES = [
    "product-thumbnail",
    "product-gallery",
    "brand-logo",
    "category-image",
    "category-banner",
    "profile-picture",
    "variant-image",
    "admin-profile"
] as const;

export type UploadConfigType = typeof UPLOAD_CONFIGS_TYPES[number];

type UploadConfig = Record<UploadConfigType, {
    folderPath: string;
    maxFileSize: number;
    minWidth: number;
    minHeight: number;
    transformation: {
        width: number;
        height: number;
        crop: "fill" | "limit" | "fit";
    };
}>;

export const UPLOAD_CONFIGS: UploadConfig = {
    "product-thumbnail": {
        folderPath: "products/thumbnails",
        maxFileSize: 3 * 1024 * 1024,
        minWidth: 800,
        minHeight: 800,
        transformation: {
            width: 800,
            height: 800,
            crop: "fill",
        }
    },
    "product-gallery": {
        folderPath: "products/gallery",
        maxFileSize: 2 * 1024 * 1024,
        minWidth: 1000,
        minHeight: 1000,
        transformation: {
            width: 1200,
            height: 1200,
            crop: "limit",
        }
    },
    "variant-image": {
        folderPath: "variants/images",
        maxFileSize: 2 * 1024 * 1024,
        minWidth: 800,
        minHeight: 800,
        transformation: {
            width: 800,
            height: 800,
            crop: "fill",
        }
    },
    "brand-logo": {
        folderPath: "brands/logos",
        maxFileSize: 1 * 1024 * 1024,
        minWidth: 300,
        minHeight: 300,
        transformation: {
            width: 400,
            height: 400,
            crop: "fit",
        }
    },
    "category-image": {
        folderPath: "categories/images",
        maxFileSize: 2 * 1024 * 1024,
        minWidth: 800,
        minHeight: 600,
        transformation: {
            width: 1000,
            height: 750,
            crop: "limit",
        }
    },
    "category-banner": {
        folderPath: "categories/banners",
        maxFileSize: 3 * 1024 * 1024,
        minWidth: 1400,
        minHeight: 600,
        transformation: {
            width: 1600,
            height: 700,
            crop: "limit",
        }
    },
    "profile-picture": {
        folderPath: "users/profiles",
        maxFileSize: 2 * 1024 * 1024,
        minWidth: 400,
        minHeight: 400,
        transformation: {
            width: 500,
            height: 500,
            crop: "fill",
        }
    },
    "admin-profile": {
        folderPath: "admin/profiles",
        maxFileSize: 2 * 1024 * 1024,
        minWidth: 400,
        minHeight: 400,
        transformation: {
            width: 500,
            height: 500,
            crop: "fill",
        }
    }
};