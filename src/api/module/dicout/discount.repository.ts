import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";
import {
    DiscountCreateInput,
    DiscountUpdateInput,
    DiscountWhereInput,
    DiscountOrderByWithRelationInput,
} from "generated/prisma/models";


class DiscountRepository {
    public async create(data: Omit<DiscountCreateInput, "id">, tx: PrismaTx = prisma) {
        return await tx.discount.create({
            data: {
                id: getUuid(),
                ...data,
            },
        });
    }

    public async update(discountId: string, data: DiscountUpdateInput, tx: PrismaTx = prisma) {
        return await tx.discount.update({
            where: { id: discountId },
            data,
        });
    }

    public async findById(discountId: string, tx: PrismaTx = prisma) {
        return await tx.discount.findUnique({
            where: { id: discountId },
        });
    }

    public async findByIdWithScope(discountId: string, tx: PrismaTx = prisma) {
        return await tx.discount.findUnique({
            where: { id: discountId },
            include: {
                discountProducts: true,
                discountCategories: true,
                _count: {
                    select: {
                        discountProducts: true,
                        discountCategories: true,
                        orders: true,
                    },
                },
            },
        });
    }

    public async findMany(args: {
        where: DiscountWhereInput;
        orderBy: DiscountOrderByWithRelationInput;
        skip: number;
        take: number;
    }) {
        return await prisma.discount.findMany({
            where: args.where,
            orderBy: args.orderBy,
            skip: args.skip,
            take: args.take,
            select: {
                id: true,
                name: true,
                type: true,
                benefitType: true,
                benefitValue: true,
                isActive: true,
                _count: {
                    select: {
                        discountProducts: true,
                        discountCategories: true,
                        orders: true,
                    }
                }
            },
        });
    }

    public async count(where: DiscountWhereInput) {
        return await prisma.discount.count({ where });
    }

    public async delete(discountId: string, tx: PrismaTx = prisma) {
        return await tx.discount.delete({
            where: { id: discountId },
        });
    }

    public async countOrdersByDiscountId(discountId: string, tx: PrismaTx = prisma) {
        return await tx.order.count({
            where: { discountId },
        });
    }

    public async createManyDiscountProducts(
        discountId: string,
        productIds: string[],
        tx: PrismaTx = prisma
    ) {
        return await tx.discountProduct.createMany({
            data: productIds.map((productId) => ({
                discountId,
                productId,
            })),
        });
    }

    public async deleteManyDiscountProducts(discountId: string, tx: PrismaTx = prisma) {
        return await tx.discountProduct.deleteMany({
            where: { discountId },
        });
    }

    public async createManyDiscountCategories(
        discountId: string,
        categoryIds: string[],
        tx: PrismaTx = prisma
    ) {
        return await tx.discountCategory.createMany({
            data: categoryIds.map((categoryId) => ({
                discountId,
                categoryId,
            })),
        });
    }

    public async deleteManyDiscountCategories(discountId: string, tx: PrismaTx = prisma) {
        return await tx.discountCategory.deleteMany({
            where: { discountId },
        });
    }

    // --- Existence checks ---

    public async countActiveProducts(productIds: string[], tx: PrismaTx = prisma) {
        return await tx.product.count({
            where: { id: { in: productIds }, status: "ACTIVE" },
        });
    }

    public async countActiveCategories(categoryIds: string[], tx: PrismaTx = prisma) {
        return await tx.category.count({
            where: { id: { in: categoryIds }, isActive: true },
        });
    }
}

export const discountRepository = new DiscountRepository();