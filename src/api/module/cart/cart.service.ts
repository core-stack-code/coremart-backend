import { prisma, PrismaTx } from "@core/config/prisma";
import { cartRepository } from "./cart.repository";
import { UpdateCartItemPayload } from "./cart.validator";

import { variantsRepository } from "@mod/variants/variants.repository";
import { ProductCartItem } from "@core/types/product";
import { paiseToRupees } from "@core/utils/product.helper";
import { AppError } from "@core/utils/response";


class CartService {
    public async addToCart(userId: string, skuId: string) {
        await prisma.$transaction(async (tx) => {
            const sku = await this.checkSku(skuId, tx);

            const cart = await cartRepository.createCart(userId, tx);

            const existingItem = await cartRepository.existingQuantity(cart.id, skuId, tx);

            const nextQuantity = existingItem
                ? existingItem.quantity + 1
                : 1;

            if (nextQuantity > sku.stock) {
                throw new AppError(400, "BAD_REQUEST", "The product is out of stock");
            }

            await cartRepository.createCartItem({
                cartId: cart.id,
                skuId,
                nextQuantity,
            }, tx);
        });
    }

    public async getCartData(userId: string) {
        const cart = await cartRepository.findCartByUserId(userId);

        let totalQuantity = 0;
        let totalPrice = 0;

        if (!cart) {
            return {
                totalQuantity,
                totalPrice,
                items: [],
            }
        }

        const cartItemsResult = await cartRepository.findCartItems(userId);

        const cartItems: ProductCartItem[] = cartItemsResult.map(item => {
            const { id, price, variant } = item.sku;
            const { product } = variant

            totalQuantity += item.quantity;
            totalPrice += paiseToRupees(price) * item.quantity;

            return {
                skuId: id,
                quantity: item.quantity,
                price: paiseToRupees(price),
                product: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    brand: product.brand ? {
                        name: product.brand.name,
                        slug: product.brand.slug,
                    } : null,
                    thumbnail: product.productImages.length > 0 ? {
                        url: product.productImages[0].url,
                        altText: product.productImages[0].altText,
                    } : null,
                },
                variant: {
                    id: variant.id,
                    size: variant.size.name,
                    color: variant.color.name,
                    material: variant.material.name,
                }
            }
        });

        return {
            totalQuantity,
            totalPrice,
            items: cartItems,
        }
    }

    public async removeFromCart(userId: string, skuId: string) {
        await prisma.$transaction(async (tx) => {
            const cart = await this.checkCart(userId, tx);

            const sku = await variantsRepository.findActiveSku(skuId, tx);
    
            if (!sku) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "SKU not found or inactive");
            }

            await cartRepository.deleteCartItem(cart.id, skuId, tx);
        });
    }

    public async updateCartItems(userId: string, skuId: string, payload: UpdateCartItemPayload) {
        await prisma.$transaction(async (tx) => {
            const cart = await this.checkCart(userId, tx);

            const sku = await this.checkSku(skuId, tx);

            const existingItem = await cartRepository.existingQuantity(cart.id, skuId, tx);

            if (!existingItem) {
                throw new AppError(404, "RESOURCE_NOT_FOUND", "Product not found in cart");
            }

            if (payload.quantity > sku.stock) {
                throw new AppError(400, "BAD_REQUEST", "The product is out of stock");
            }

            if (payload.quantity < 1) {
                await cartRepository.deleteCartItem(cart.id, skuId, tx);
            } else {
                await cartRepository.updateCartItem({
                    cartId: cart.id,
                    skuId: skuId,
                    quantity: payload.quantity,
                }, tx);
            }
        });
    }

    public async clearCart(userId: string) {
        await prisma.$transaction(async (tx) => {
            const cart = await this.checkCart(userId, tx);

            await cartRepository.clearCart(cart.id, tx);
        });
    }


    public async checkCart(userId: string, tx: PrismaTx = prisma) {
        const cart = await cartRepository.findCartByUserId(userId, tx);
    
        if (!cart) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Cart not found");
        }

        return cart;
    }

    private async checkSku(skuId: string, tx: PrismaTx) {
        const sku = await variantsRepository.findActiveSku(skuId, tx);

        if (!sku) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "SKU not found or inactive");
        }

        if (sku.stock < 1) {
            throw new AppError(400, "BAD_REQUEST", "The product is out of stock");
        }

        return sku;
    }
}

export const cartService = new CartService();