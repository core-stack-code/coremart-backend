import { NumberFoundLegacy } from "libphonenumber-js";
import { PaginationType } from "./common";

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