import { beforeEach, describe, expect, it, vi } from "vitest";

const tx = {};

vi.mock("@core/config/prisma", () => ({
    prisma: {
        $transaction: vi.fn(async (callback) => callback(tx)),
    },
}));

vi.mock("./cart.repository", () => ({
    cartRepository: {
        clearCart: vi.fn(),
        createCart: vi.fn(),
        createCartItem: vi.fn(),
        deleteCartItem: vi.fn(),
        existingQuantity: vi.fn(),
        findCartByUserId: vi.fn(),
        findCartItems: vi.fn(),
        updateCartItem: vi.fn(),
    },
}));

vi.mock("@mod/variants/variants.repository", () => ({
    variantsRepository: {
        findActiveSku: vi.fn(),
    },
}));

import { prisma } from "@core/config/prisma";
import { variantsRepository } from "@mod/variants/variants.repository";
import { cartRepository } from "./cart.repository";
import { cartService } from "./cart.service";

describe("cartService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("addToCart", () => {
        it("adds one item when sku has stock and item is not already in cart", async () => {
            vi.mocked(variantsRepository.findActiveSku).mockResolvedValue({
                id: "sku-1",
                stock: 5,
            } as Awaited<ReturnType<typeof variantsRepository.findActiveSku>>);
            vi.mocked(cartRepository.createCart).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartRepository.createCart>>);
            vi.mocked(cartRepository.existingQuantity).mockResolvedValue(null);

            await cartService.addToCart("user-1", "sku-1");

            expect(prisma.$transaction).toHaveBeenCalledOnce();
            expect(variantsRepository.findActiveSku).toHaveBeenCalledWith("sku-1", tx);
            expect(cartRepository.createCart).toHaveBeenCalledWith("user-1", tx);
            expect(cartRepository.existingQuantity).toHaveBeenCalledWith("cart-1", "sku-1", tx);
            expect(cartRepository.createCartItem).toHaveBeenCalledWith({
                cartId: "cart-1",
                skuId: "sku-1",
                nextQuantity: 1,
            }, tx);
        });

        it("rejects when next quantity is greater than sku stock", async () => {
            vi.mocked(variantsRepository.findActiveSku).mockResolvedValue({
                id: "sku-1",
                stock: 2,
            } as Awaited<ReturnType<typeof variantsRepository.findActiveSku>>);

            vi.mocked(cartRepository.createCart).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartRepository.createCart>>);

            vi.mocked(cartRepository.existingQuantity).mockResolvedValue({
                quantity: 2,
            } as Awaited<ReturnType<typeof cartRepository.existingQuantity>>);

            await expect(
                cartService.addToCart("user-1", "sku-1"),
            ).rejects.toThrow("The product is out of stock");

            expect(cartRepository.createCartItem).not.toHaveBeenCalled();
        });
    });

    describe("updateCartItems", () => {
        it("deletes cart item when quantity is zero", async () => {
            vi.mocked(cartRepository.findCartByUserId).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartRepository.findCartByUserId>>);

            vi.mocked(variantsRepository.findActiveSku).mockResolvedValue({
                id: "sku-1",
                stock: 10,
            } as Awaited<ReturnType<typeof variantsRepository.findActiveSku>>);

            vi.mocked(cartRepository.existingQuantity).mockResolvedValue({
                quantity: 3,
            } as Awaited<ReturnType<typeof cartRepository.existingQuantity>>);

            await cartService.updateCartItems("user-1", "sku-1", { quantity: 0 });

            expect(cartRepository.deleteCartItem).toHaveBeenCalledWith("cart-1", "sku-1", tx);
            expect(cartRepository.updateCartItem).not.toHaveBeenCalled();
        });
    });

    describe("getCartData", () => {
        it("returns totals and formatted cart items", async () => {
            vi.mocked(cartRepository.findCartByUserId).mockResolvedValue({
                id: "cart-1",
            } as Awaited<ReturnType<typeof cartRepository.findCartByUserId>>);
            
            vi.mocked(cartRepository.findCartItems).mockResolvedValue([
                {
                    quantity: 2,
                    sku: {
                        id: "sku-1",
                        price: 129900,
                        variant: {
                            id: "variant-1",
                            size: { name: "M" },
                            color: { name: "Black" },
                            material: { name: "Cotton" },
                            product: {
                                id: "product-1",
                                name: "Core Tee",
                                slug: "core-tee",
                                brand: {
                                    name: "CoreMart",
                                    slug: "coremart",
                                },
                                productImages: [
                                    {
                                        url: "https://example.com/tee.jpg",
                                        altText: "Core Tee",
                                    },
                                ],
                            },
                        },
                    },
                },
            ] as Awaited<ReturnType<typeof cartRepository.findCartItems>>);

            const result = await cartService.getCartData("user-1");

            expect(result).toEqual({
                totalQuantity: 2,
                totalPrice: 2598,
                items: [
                    {
                        skuId: "sku-1",
                        quantity: 2,
                        price: 1299,
                        product: {
                            id: "product-1",
                            name: "Core Tee",
                            slug: "core-tee",
                            brand: {
                                name: "CoreMart",
                                slug: "coremart",
                            },
                            thumbnail: {
                                url: "https://example.com/tee.jpg",
                                altText: "Core Tee",
                            },
                        },
                        variant: {
                            id: "variant-1",
                            size: "M",
                            color: "Black",
                            material: "Cotton",
                        },
                    },
                ],
            });
        });
    });
});
