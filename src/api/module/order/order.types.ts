export const orderStatus = ["ACTIVE", "PAID", "EXPIRED", "CANCELLED"] as const;

export type OrderStatus = typeof orderStatus[number];

export type ProductItem = {
    productId: string;
    name: string;
    slug: string;
    category: string;
    price: number;
    image: string;
}

export type ShippingAddress = {
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export type CutomerDetials = {
    fullName: string;
    phone: string;
}