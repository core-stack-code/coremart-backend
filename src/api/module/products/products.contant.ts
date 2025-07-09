
export const colorsEnum = [
  'black', 'white', 'blue', 'red', 'green', 'yellow',
  'purple', 'pink', 'orange', 'gray', 'brown',
] as const;

export const sizesEnum = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] as const;

export const categoryEnum = ['casual', 'formal', 'sportswear', 'sleepwear', 'outerwear', 'workoutwear'] as const;

export const dressTypeEnum = [
  't-shirt', 'pant', 'hoodie', 'jacket', 'shoes', 
  'dress', 'skirt', 'shorts', 'sweater','sweatshirt',
] as const;

export const tagsEnum = ['best-seller', 'new-arrival', 'limited-edition', 'sale', 'tranding'] as const;
// best-seller : most sold,
// new-arrival : recently added, 
// limited-edition : exclusive items (add by admin maybe, or add auto logic),
// sale : discounted items,
// tranding : currently popular items based on sales and reviews

export const sortByValues = ['name', 'price-ace', 'price-dce', 'rating', 'date'] as const;
// name : alphabetical order,   popular : based on sold count and rating


// ---------- Some helper constants ----------
export const PRODUCT_LIST_FIELDS = 'name slug brand price category dressType images';