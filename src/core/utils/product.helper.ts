import { ProductListItem, ProductListResultItem } from "@core/types/product";

export function rupeesToPaise(value: number): number {
    return Math.round(value * 100);
}

export function paiseToRupees(value: number): number {
    return Number((value / 100).toFixed(2));
}

export const formatProductListItem = (
    products: ProductListResultItem[],
    favoriteSet: Set<string> | boolean,
    addIsFavorite = true
): ProductListItem[] => {
    return products.map((p) => {
        const prices = p.variants
            .map((v) => v.sku?.price)
            .filter((price): price is number => typeof price === "number");

        const price = prices.length ? paiseToRupees(Math.min(...prices)) : null;

        const isFavorite = typeof favoriteSet === "boolean" ? favoriteSet : favoriteSet.has(p.id);

        const product = {
            id: p.id,
            name: p.name,
            slug: p.slug,
            brand: p.brand,
            description: p.description,
            thumbnail: p.productImages[0] ?? null,
            price,
        };

        return addIsFavorite ? { ...product, isFavorite } : product;
    });
}