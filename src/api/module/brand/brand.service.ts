import { CreateBrandPayload, UpdateBrandPayload } from "./brand.validator";
import { brandRepository } from "./brand.repository";
import { AppError } from "@core/utils/response";
import { slugify } from "@core/utils/db.helper";

class BrandService {
    public handleCreate = async (payload: CreateBrandPayload) => {
        return await brandRepository.create({
            name: payload.name,
            slug: slugify(payload.name),
            logUrl: payload.logoUrl ?? null,
        });
    }

    public handleUpdate = async (id: string, payload: UpdateBrandPayload) => {
        return await brandRepository.update(id, {
            name: payload.name ?? undefined,
            slug: payload.name ? slugify(payload.name) : undefined,
            isActive: payload.isActive ?? undefined,
            logoUrl: payload.logoUrl ?? undefined,
        });
    }

    public getBrandList = async () => {
        const brands = await brandRepository.findAllWithProductCount();

        return brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            isActive: brand.isActive,
            logoUrl: brand.logoUrl,
            productCount: brand._count.products,
        }));
    }

    public getBrandSimpleList = async () => {
        return await brandRepository.findAllSimple();
    }

    public assignProduct = async (brandId: string, productId: string) => {
        const brand = await brandRepository.exists(brandId);

        if (!brand) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Brand not found");
        }

        return await brandRepository.assignProductToBrand(brandId, productId);
    }

    public removeProduct = async (brandId: string, productId: string) => {
        const brand = await brandRepository.exists(brandId);

        if (!brand) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Brand not found");
        }

        return await brandRepository.removeProductFromBrand(productId);
    }
}

export const brandService = new BrandService();
