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
    };
    price: number | null;
    isFavorite?: boolean;
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
    brand: { name: string; slug: string } | null;
    variants: Array<{ sku: { price: number } | null }>;
    productImages: Array<{ url: string; altText: string | null }>;
}