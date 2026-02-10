import { CreateProductPayload, UpdateProductPayload } from "./product.validator";
import { productRepository, UpdateProductInput } from "./product.repository";
import { AppError } from "@core/utils/response";
import { slugify } from "@core/utils/db.helper";


class ProductService {
    public handleCreate = async (payload: CreateProductPayload) => {
        return await productRepository.create({
            name: payload.name,
            description: payload.description,
            slug: slugify(payload.name),
        });
    }

    public handleUpdate = async (id: string, payload: UpdateProductPayload) => {
        const updateData: UpdateProductInput = {...payload};

        if (payload.name) {
            updateData.slug = slugify(payload.name);
        }

        return await productRepository.update(id, {
            ...updateData,
        });
    }

    public getProductList = async () => {
        return await productRepository.getList();
    }

    public getProduct = async (productId: string) => {
        const product = await productRepository.findById(productId);

        if (!product) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found");
        }
        return product;
    }
}

export const productService = new ProductService();