export type CartItem = {
    product: {
        _id: string;
        name: string;
        slug: string;
        category: string;
        price: number;
        image: string;
    },
    quantity: number;
    itemTotal: number;
}


export type CartResponse = {
    items: CartItem[],
    totalPrice: number,
    totalQuantity: number
}