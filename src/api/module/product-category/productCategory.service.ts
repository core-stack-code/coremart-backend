import { productRepository } from "@mod/product/product.repository";
import { productCategoryRepository } from "./productCategory.repository";
import { CreateProductCategoryPayload } from "./productCategory.validator";
import { categoryService } from "@mod/category/category.service";


class ProductCategoryService {
    public async createProductCategory(productId: string, payload: CreateProductCategoryPayload) {
        const product = await productRepository.exists(productId);

        if (!product) {
            throw new Error("Product not found");
        }

        await categoryService.checkCategoryActive(payload.categoryId);

        await productCategoryRepository.create(productId, payload.categoryId);
    }

    public async deleteProductCategory(productId: string, categoryId: string) {
        await productCategoryRepository.delete(productId, categoryId);
    }

    public async getProductsByCategory(categoryId: string) {
        const resut = await productCategoryRepository.findProductsByCategory(categoryId);
        
        return resut.map(item => {
            const { productImages, ...rest } = item.product;
            return {
                ...rest,
                thumbnail: productImages.length > 0 
                    ? productImages[0] 
                    : null
            };
        });
    }
}

export const productCategoryService = new ProductCategoryService();