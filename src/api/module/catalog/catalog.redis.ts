import { getCache } from "@core/lib/redis/cache";
import { ProductListQuery } from "./catalog.validator";
import { getRedisKeys } from "@core/utils/gerRedisKeys";


class CatalogRedis {
    public async getProductList (query: ProductListQuery) {
        const contexKey = JSON.stringify(query);
        const key = getRedisKeys('cache', 'products:list', contexKey);

        const products = await getCache<ProductListQuery>(key);
    }

}

export const catalogRedis = new CatalogRedis();