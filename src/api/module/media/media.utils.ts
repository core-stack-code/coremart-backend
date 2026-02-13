
export const Image_FORMATE = ['jpg', 'jpeg', 'png', 'webp'] as const;

export const UPLOAD_CONFIGS_TYPES = [
    "product-thumbnail",
    "product-gallery",
    "brand-logo",
    "category-image",
    "category-banner",
] as const;

export type UploadConfigType = typeof UPLOAD_CONFIGS_TYPES[number];

type UpdloadCnfig = Record<UploadConfigType, {
    folderPath: string;
    maxFileSize: number;
}>;

export const UPLOAD_CONFIGS: UpdloadCnfig = {
    "product-thumbnail": {
        folderPath: "products/thumbnails",
        maxFileSize: 3 * 1024 * 1024, // 3MB
    },
    "product-gallery": {
        folderPath: "products/gallery",
        maxFileSize: 2 * 1024 * 1024, // 2MB
    },
    "brand-logo": {
        folderPath: "brands/logos",
        maxFileSize: 1 * 1024 * 1024, // 1MB
    },
    "category-image": {
        folderPath: "categories/images",
        maxFileSize: 2 * 1024 * 1024, // 2MB
    },
    "category-banner": {
        folderPath: "categories/banners",
        maxFileSize: 3 * 1024 * 1024, // 3MB
    },
}