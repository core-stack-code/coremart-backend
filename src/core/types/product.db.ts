import { ProductSelect } from "generated/prisma/models"

export const ProductDbList = {
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
        where: {
            sku: { is: { isActive: true } },
        },
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
} as const satisfies ProductSelect