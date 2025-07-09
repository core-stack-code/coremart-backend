import { dressTypeEnum, sizesEnum, categoryEnum } from "./products.contant";
import { ProductLean } from "./products.modal";

export type Size = (typeof sizesEnum)[number];
export type Category = (typeof categoryEnum)[number];
export type DressType = (typeof dressTypeEnum)[number];
// export type ProductTag = (typeof tagsEnum)[number];


export interface IProduct {
    name: string;
    slug: string; // for SEO-friendly URL
    description: string;
    brand: string;
    price: number;
    sizes: Size[];
    category: Category;
    dressType: DressType;
    images: string[];
    stock: number; // how much in the stock
    sold: number; // how much it has sold
    rating: number; // average rating
    numReviews: number; // number of reviews
    isActive: boolean;
    attributes: Record<string, string>;
    createdAt?: Date;
    updatedAt?: Date;
}

export type ProductWithFav = ProductLean & { isFav: boolean };

export type SortAndPageType = {
    skip: number;
    limit: number;
    sort: Record<string, 1 | -1>;
}