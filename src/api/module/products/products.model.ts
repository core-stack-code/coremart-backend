import { Document, Schema, Types, model } from 'mongoose';
import { IProduct } from './products.types';
import { categoryEnum, dressTypeEnum, sizesEnum } from './products.contant';
import { slugify } from '@core/utils/db.helper';


const productSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },

    brand: { type: String, required: true },
    price: { type: Number, required: true },

    sizes: [{
        type: String,
        enum: sizesEnum,
    }],

    category: { 
        type: String,
        enum: categoryEnum,
        required: true
    },
    dressType: {
        type: String,
        enum: dressTypeEnum,
        required: true
    },

    images: { type: [String], required: true },

    stock: { type: Number, required: true, default: 0 },
    sold: { type: Number, required: true, default: 0 },

    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },

    attributes: {
        type: Object,
        default: {},
    },

    isActive: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

productSchema.pre('save', async function (next) {
    if (!this.isModified('name')) return next();

    const baseSlug = slugify(this.name);
    let slug = baseSlug;
    let count = 1;

    while (await Product.exists({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    this.slug = slug;
    next();
});

productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ dressType: 1 });
productSchema.index({ dressStyle: 1 });

export const Product = model<IProduct>('Product', productSchema);

export type ProductDocument = IProduct & Document;
export interface ProductLean  extends IProduct {
    _id: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}