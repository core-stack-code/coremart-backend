import { Model, Types } from "mongoose";

export const fetchUserSavedProducts = async (collection: Model<any>, userId: Types.ObjectId) => {
    return await collection.aggregate([
        { $match: { userId } },
        {
            $lookup: {
                from: 'products',
                localField: 'productId',
                foreignField: '_id',
                as: 'product',
            },
        },
        { $unwind: '$product' },
        {
            $project: {
                _id: '$product._id',
                name: '$product.name',
                slug: '$product.slug',
                brand: '$product.brand',
                price: '$product.price',
                category: '$product.category',
                dressType: '$product.dressType',
                image: { $arrayElemAt: ['$product.images', 0] },
                description: '$product.description',
            },
        },
    ]);
};
