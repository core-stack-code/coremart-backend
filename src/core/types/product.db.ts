import { ProductSelect } from "generated/prisma/models"

export const ProductDbList: ProductSelect = {
    id: true,
    name: true,
    slug: true,
    description: true,
    rating: true,
    totalReviews: true,
    brand: {
        select: {
            name: true,
            slug: true,
        },
    },
    variants: {
        select: {
            imageUrl: true,
            sku: { select: { price: true } },
        },
    },
    productImages: {
        where: { type: "THUMBNAIL" },
        select: {
            url: true,
            altText: true,
        },
        take: 1,
    },
}