import { ProductStatus } from "generated/prisma/enums";
import { PaginationType } from "./common";

export type ProductImage = {
    url: string;
    altText: string | null;
    createdAt: Date;
}

// -------------------- ADMIN SIDE TYPES --------------------
export type ProductsItem = {
    id: string,
    name: string,
    slug: string,
    status: ProductStatus,
    createdAt: Date,
    updatedAt: Date,
    thumbnail: { url: string, altText: string | null } | null,
    variantsCount: number,
    brand: { name: string, id: string } | null,
}

export type ProductDetailItem = {
    id: string;
    name: string;
    slug: string;
    description: string;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    rating: number;
    totalReviews: number;
    brand: {
        name: string;
        id: string;
        logoUrl: string | null;
    } | null;
    variants: Array<{
        id: string;
        imageUrl: string | null;
        sku: {
            id: string;
            price: number;
            stock: number;
            skuCode: string;
            isActive: boolean;
        } | null;
        size: string;
        color: string;
        material: string;
    }>;
    thumbnail: ProductImage | null;
    images: Array<ProductImage>;
    categories: {
        name: string;
        id: string;
    }[] | null;
}


// -------------------- USER SIDE TYPES --------------------
export type ProductListItem = {
    id: string;
    name: string;
    slug: string;
    brand: {
        name: string;
        slug: string;
    } | null;
    description: string;
    thumbnail: {
        url: string;
        altText: string | null;
    } | null;
    price: number | null;
    isFavorite?: boolean;
    rating: number;
    totalReviews: number;
}

export type ProductListApiResponse = {
    products: ProductListItem[];
    pagination: PaginationType;
}

export type ProductListResultItem = {
    name: string;
    id: string;
    slug: string;
    description: string;
    rating: number;
    totalReviews: number;
    brand: { name: string; slug: string } | null;
    variants: Array<{ sku: { price: number } | null }>;
    productImages: Array<{ url: string; altText: string | null }>;
}

export type ProductCartItem = {
    skuId: string;
    quantity: number;
    price: number;
    product: {
        id: string;
        name: string;
        slug: string;
        brand: {
            name: string;
            slug: string;
        } | null;
        thumbnail: {
            url: string;
            altText: string | null;
        } | null;
    },
    variant : {
        id: string;
        size: string,
        color: string,
        material: string,
    }
}

export type ProductDetailApiResponse = {
    product: {
        name: string;
        slug: string;
        description: string;
        brand: {
            name: string | null;
            slug: string | null;
            logoUrl: string | null;
        };
        thumbnailImage: {
            url: string;
            altText: string | null;
        } | null;
        images: {
            url: string;
            altText: string | null;
        }[];
        isFavorite: boolean;
    };
    categories: {
        name: string;
        slug: string;
    }[];
    attributes: {
        sizes: string[];
        colors: string[];
        materials: string[];
    };
    variants: ProductVariantWithSKU[];
    review: {
        averageRating: number;
        totalReviews: number;
        breakdown: Record<number, number>;
    };
}

// -------------------- OTHER TYPES --------------------
export type ProductVariantWithSKU = {
    size: string;
    color: string;
    material: string;
    price: number;
    imageUrl: string | null;
    inStock: boolean;
}