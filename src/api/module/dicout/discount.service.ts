import { prisma } from "@core/config/prisma";
import { DiscountWhereInput } from "generated/prisma/models";
import { discountRepository } from "./discount.repository";
import {
    CreateDiscountPayload,
    UpdateDiscountPayload,
    ReplaceScopePayload,
    DiscountListQuery,
} from "./discount.validator";
import { getPaginationData } from "@core/utils/getPaginatoinData";
import { AppError } from "@api/utils/response";


class DiscountService {
    public async createDiscount(payload: CreateDiscountPayload) {
        const { productIds, categoryIds, ...discountData } = payload;

        await this.validateScopeIds(productIds ?? [], categoryIds ?? []);

        await prisma.$transaction(async (tx) => {
            const discount = await discountRepository.create(discountData, tx);

            if (productIds && productIds.length > 0) {
                await discountRepository.createManyDiscountProducts(discount.id, productIds, tx);
            }

            if (categoryIds && categoryIds.length > 0) {
                await discountRepository.createManyDiscountCategories(discount.id, categoryIds, tx);
            }
        });
    }

    public async updateDiscount(discountId: string, payload: UpdateDiscountPayload) {
        const existDiscount = await this.existDiscount(discountId);

        if (payload.type && payload.type !== existDiscount.type) {
            throw new AppError(400, "BAD_REQUEST", "Changing discount type is not allowed");
        }

        const updated = await discountRepository.update(discountId, payload);
        return updated;
    }

    public async replaceScope(discountId: string, payload: ReplaceScopePayload) {
        const existDiscount = await this.existDiscount(discountId);

        const productIds = payload.productIds ?? [];
        const categoryIds = payload.categoryIds ?? [];

        await this.validateScopeIds(productIds, categoryIds);

        await prisma.$transaction(async (tx) => {
            await discountRepository.deleteManyDiscountProducts(discountId, tx);
            await discountRepository.deleteManyDiscountCategories(discountId, tx);

            if (productIds.length > 0) {
                await discountRepository.createManyDiscountProducts(discountId, productIds, tx);
            }

            if (categoryIds.length > 0) {
                await discountRepository.createManyDiscountCategories(discountId, categoryIds, tx);
            }
        });

        return {
            discountId,
            scopeProductCount: productIds.length,
            scopeCategoryCount: categoryIds.length,
        };
    }

    public async getDiscountList(query: DiscountListQuery) {
        const skip = (query.page - 1) * query.limit;
        const take = query.limit;

        const where: DiscountWhereInput = {};
        if (query.type) where.type = query.type;
        if (query.isActive !== undefined) where.isActive = query.isActive;

        const [discounts, total] = await Promise.all([
            discountRepository.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take,
            }),
            discountRepository.count(where),
        ]);

        const pagination = getPaginationData(query.page, query.limit, total);

        const formateDiscount = discounts.map((d) => {
            const { _count, ...discount } = d;

            return {
                ...discount,
                scopeProductCount: _count.discountProducts,
                scopeCategoryCount: _count.discountCategories,
            };
        })

        return { 
            discounts: formateDiscount,
            pagination,
         };
    }

    public async getDiscountById(discountId: string) {
        const discount = await discountRepository.findByIdWithScope(discountId);

        if (!discount) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Discount not found");
        }

        const { _count, ...discountData } = discount;

        const discountProducts = discount.discountProducts.map((dp) => dp.productId);
        const discountCategories = discount.discountCategories.map((dc) => dc.categoryId);

        return {
            ...discountData,
            discountProducts,
            discountCategories,
            scopeProductCount: _count.discountProducts,
            scopeCategoryCount: _count.discountCategories,
        };
    }

    public async deleteDiscount(discountId: string) {
        const existedDiscount = await this.existDiscount(discountId);

        const orderCount = await discountRepository.countOrdersByDiscountId(discountId);

        if (orderCount > 0) {
            throw new AppError(
                400,
                "BAD_REQUEST",
                "Cannot delete discount that has been used in orders"
            );
        }

        await discountRepository.delete(discountId);
    }


    private async existDiscount (discountId: string) {
        const existedDiscount = await discountRepository.findById(discountId);

        if (!existedDiscount) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Discount not found");
        }

        return existedDiscount;
    }

    private async validateScopeIds(productIds: string[], categoryIds: string[]) {
        if (productIds.length > 0) {
            const validProducts = await discountRepository.countActiveProducts(productIds);
            if (validProducts !== productIds.length) {
                throw new AppError(400, "BAD_REQUEST", "One or more product IDs are invalid or inactive");
            }
        }

        if (categoryIds.length > 0) {
            const validCategories = await discountRepository.countActiveCategories(categoryIds);
            if (validCategories !== categoryIds.length) {
                throw new AppError(400, "BAD_REQUEST", "One or more category IDs are invalid or inactive");
            }
        }
    }
}

export const discountService = new DiscountService();