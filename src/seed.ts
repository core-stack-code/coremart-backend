import { faker } from '@faker-js/faker';
import { Product } from "./api/module/product/products.model";
import { sizesEnum, categoryEnum, dressTypeEnum } from "./api/module/product/products.contant";
import { log } from "./api/utils/log";
import { connectDB } from './core/config/database';
import { IProduct } from './api/module/product/products.types';
import { slugify } from 'node_modules/zod/v4/core/util.cjs';

const NUMBER_OF_PRODUCTS = 350;

const fashionBrands = [
  'Zara', 'H&M', 'Nike', 'Adidas', 'Puma', 'Levi’s', 'Gucci', 'Uniqlo', 'Mango', 'Forever 21',
  'Reebok', 'Calvin Klein', 'Tommy Hilfiger', 'Patagonia', 'ASOS', 'Bershka'
];

const namePrefixes = [
  'Classic', 'Modern', 'Oversized', 'Slim Fit', 'Trendy', 'Essential', 'Relaxed', 'Premium', 'Athletic', 'Chic'
];

const nameSuffixes = [
  'T-Shirt', 'Pants', 'Hoodie', 'Jacket', 'Dress', 'Sweatshirt', 'Shorts', 'Skirt', 'Sneakers', 'Blouse'
];

const styleAdjectives = ['sleek', 'comfortable', 'durable', 'lightweight', 'trendy', 'breathable', 'versatile'];

const dressFeatures = [
    'perfect for casual outings',
    'ideal for winter wear',
    'a must-have for summer days',
    'designed for both comfort and style',
    'easy to layer with other outfits',
    'crafted for daily comfort',
];

const attributeOptions: Record<string, string[]> = {
    material: ['cotton', 'polyester', 'linen', 'wool', 'silk', 'denim', 'nylon', 'rayon'],
    pattern: ['solid', 'striped', 'checked', 'printed', 'floral', 'graphic'],
    sleeveLength: ['sleeveless', 'short', 'three-quarter', 'long'],
    neckStyle: ['round', 'v-neck', 'collared', 'turtleneck'],
    fit: ['regular', 'slim', 'oversized', 'relaxed'],
    washCare: ['machine wash', 'hand wash', 'dry clean only'],
    stretchability: ['stretchable', 'non-stretchable'],
    closure: ['zip', 'button', 'pull-on', 'lace-up'],
    occasion: ['casual', 'formal', 'party', 'gym', 'beach'],
};

const generateRandomAttributes = (): Record<string, string> => {
    const keys = faker.helpers.arrayElements(Object.keys(attributeOptions), faker.number.int({ min: 5, max: 8 }));

    const attributes: Record<string, string> = {};

    for (const key of keys) {
        const values = attributeOptions[key];
        attributes[key] = faker.helpers.arrayElement(values);
    }

    return attributes;
};

const usedSlugs = new Set<string>();

const generateUniqueSlug = async (base: string): Promise<string> => {
    let slug = slugify(base);
    let count = 1;
    while (usedSlugs.has(slug) || await Product.exists({ slug })) {
        slug = `${slugify(base)}-${count}`;
        count++;
    }
    usedSlugs.add(slug);
    return slug;
};


const generateRandomProduct = async () => {
    const name = `${faker.helpers.arrayElement(namePrefixes)} ${faker.helpers.arrayElement(nameSuffixes)}`;
    const slug = await generateUniqueSlug(name);

    const description = `${faker.lorem.paragraph()}
    This ${faker.helpers.arrayElement(styleAdjectives)} outfit is ${faker.helpers.arrayElement(dressFeatures)}.`;

    const brand = faker.helpers.arrayElement(fashionBrands);

    const price = parseFloat(faker.commerce.price({ min: 100, max: 10000 }));
    const sizes = faker.helpers.arrayElements(sizesEnum, faker.number.int({ min: 1, max: sizesEnum.length }));
    const category = faker.helpers.arrayElement(categoryEnum);
    const dressType = faker.helpers.arrayElement(dressTypeEnum);
    const images = Array.from({ length: 3 }, () => faker.image.urlPicsumPhotos({ width: 640, height: 480 }));
    const stock = faker.number.int({ min: 0, max: 100 });
    const sold = faker.number.int({ min: 0, max: 50 });
    const rating = faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
    const numReviews = faker.number.int({ min: 0, max: 200 });

    const createdAt = faker.date.recent({ days: 60 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    return {
        name,
        slug ,
        description,
        brand,
        price,
        sizes,
        category,
        dressType,
        images,
        stock,
        sold,
        rating,
        numReviews,
        isActive: true,
        createdAt,
        updatedAt,
        attributes: generateRandomAttributes(), 
    };
}

const seed = async () => {
    try {
        await connectDB()
        await Product.deleteMany({});

        const products: IProduct[] = [];
    
        for (let i = 0; i < NUMBER_OF_PRODUCTS; i++) {
            const product = await generateRandomProduct();
            products.push(product);
        }

        await Product.insertMany(products);
        log.info(`Seeded ${products.length} products successfully.`);
    }
    catch (error) {
        log.error('error in seed', error);
    }
}

seed();