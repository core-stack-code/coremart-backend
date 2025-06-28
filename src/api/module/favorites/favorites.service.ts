import { ProductLean  } from "../products/products.model";
import { Favorites } from "./favorites.modal";

export type ProductWithFav = ProductLean & { isFav: boolean };

export const getFavoritesFromProducts = async (products: ProductLean[], userId: string): Promise<ProductWithFav[]> => {
    const productsIds = products.map(product => product._id);

    const favorites = await Favorites.find({
        productId: { $in: productsIds }, 
        userId
    }).select('productId').lean();

    const favoriteSet = new Set(favorites.map(fav => fav.productId.toString()));

    const productsWithFav = products.map((p) => {
        return {
            ...p,
            isFav: favoriteSet.has(p._id.toString()),
        };
    });

    return productsWithFav;
}