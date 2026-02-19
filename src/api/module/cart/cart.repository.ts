import { prisma, PrismaTx } from "@core/config/prisma";
import { getUuid } from "@core/utils/db.helper";


class CartRepository {
    public async existingQuantity(cartId: string, skuId: string, tx: PrismaTx = prisma) {
        return await tx.cartItem.findUnique({
            where: {
                cartId_skuId: { cartId, skuId },
            },
            select: {
                quantity: true,
            },
        });
    }

    public async createCart(userId: string, tx: PrismaTx = prisma) {
        return await tx.cart.upsert({
            where: { userId },
            update: {},
            create: {
                id: getUuid(),
                userId,
            },
            select: { 
                id: true
            },
        });
    }

    public async createCartItem(args: {
        cartId: string;
        skuId: string;
        nextQuantity: number;
    }, tx: PrismaTx = prisma) {
        await tx.cartItem.upsert({
            where: {
                cartId_skuId: { 
                    cartId: args.cartId,
                    skuId: args.skuId
                }
            },
            update: {
                quantity: args.nextQuantity,
            },
            create: {
                cartId: args.cartId,
                skuId: args.skuId,
                quantity: 1,
            }
        });
    }

    public async updateCartItem(args: {
        cartId: string;
        skuId: string;
        quantity: number;
    }, tx: PrismaTx = prisma) {
        await tx.cartItem.update({
            where: {
                cartId_skuId: { cartId: args.cartId, skuId: args.skuId },
            },
            data: {
                quantity: args.quantity,
            },
        });
    }

    public async findCartItems(userId: string, tx: PrismaTx = prisma) {
        return await tx.cartItem.findMany({
            where: {
                cart: { userId },
                sku: {
                    isActive: true,
                    variant: {
                        product: {
                            status: "ACTIVE",
                        },
                    },
                }
            },
            select: {
                quantity: true,
                sku: {
                    select: {
                        id: true,
                        price: true,
                        variant: {
                            select: {
                                id: true,
                                size: { select: { name: true } },
                                color: { select: { name: true } },
                                material: { select: { name: true } },
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                        brand: {
                                            select: {
                                                name: true,
                                                slug: true,
                                            },
                                        },
                                        productImages: {
                                            where: { type: "THUMBNAIL" },
                                            take: 1,
                                            select: {
                                                url: true,
                                                altText: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
    }

    public async findCartByUserId(userId: string, tx: PrismaTx = prisma) {
        return await tx.cart.findUnique({
            where: { userId },
        });
    }

    public async deleteCartItem(cartId: string, skuId: string, tx: PrismaTx = prisma) {
        await tx.cartItem.delete({
            where: {
                cartId_skuId: { cartId, skuId },
            },
        });
    }

    public async clearCart(cartId: string, tx: PrismaTx = prisma) {
        await tx.cartItem.deleteMany({
            where: { cartId },
        });
    }
}

export const cartRepository = new CartRepository();