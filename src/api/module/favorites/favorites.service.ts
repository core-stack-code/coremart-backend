import { favoritesRepository } from "./favorites.repository";
import { FavoriteListQuery } from "./favorites.validator";

import { ProductListApiResponse, ProductListResultItem } from "@core/types/product";
import { getPaginationData } from "@core/utils/getPaginatoinData";
import { formatProductListItem, productFavoriteMapping } from "@core/utils/product.helper";
import { catalogService } from "@mod/catalog/catalog.service";


class FavoritesService {
    public async getFavoritesList(
        userId: string,
        query: FavoriteListQuery
    ): Promise<ProductListApiResponse> {

        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const favoriteResults = await favoritesRepository.findFavoriteProducts(
            userId,
            skip,
            take,
        );

        const products: ProductListResultItem[] = favoriteResults.map(fav => fav.product);

        const total = await favoritesRepository.countFavoriteProducts(userId);

        const formattedProducts = formatProductListItem(products);
        const favoriteMappedProducts = productFavoriteMapping(formattedProducts, true);
        const pagination = getPaginationData(query.page, query.limit, total);

        return {
            products: favoriteMappedProducts,
            pagination
        };
    }

    public async addFavorite(userId: string, productId: string): Promise<void> {
        await catalogService.checkActiveProduct(productId);

        await favoritesRepository.addFavorite({
            userId,
            productId,
        });
    }

    public async removeFavorite(userId: string, productId: string): Promise<void> {
        await favoritesRepository.removeFavorite(userId, productId);
    }

    public async findFavoriteProducts(userId: string, productIds: string[]) {
        const favorites = await favoritesRepository.findByUserAndProductIds(userId, productIds);

        const favoriteProductSet = new Set(favorites.map(fav => fav.productId));

        return favoriteProductSet;
    }
}

export const favoritesService = new FavoritesService();