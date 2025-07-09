import { fetchUserSavedProducts } from "../../utils/dbUtils";
import { ProductLean  } from "../products/products.modal";
import { ProductWithFav } from "../products/products.types";
import { Favorites } from "./favorites.modal";
import { Types } from "mongoose";

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

export const getFavoritesByProductId = async (productId: Types.ObjectId, userId: Types.ObjectId): Promise<boolean> => {
    const favorite = await Favorites.findOne({ productId, userId }).lean();
    return !!favorite;
}


export const getFavoritesList = async (userId: Types.ObjectId) => {
    return await fetchUserSavedProducts(Favorites, userId);
}


export const toggleFavorite = async (productId: Types.ObjectId, userId: Types.ObjectId) => {
    const existing = await Favorites.findOne({ productId, userId });

    if (existing) {
        await Favorites.deleteOne({ _id: existing._id });
    } else {
        await Favorites.create({ productId, userId });
    }
};