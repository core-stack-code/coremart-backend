
export const generateSkuCode = (productSlug: string, size: string, color: string, material: string): string => {
    return [
        productSlugToCode(productSlug),
        normalizePart(size, 3),
        normalizePart(color, 3),
        normalizePart(material, 3),
    ].join('-')
}

export function rupeesToPaise(value: number): number {
    return Math.round(value * 100);
}

export function paiseToRupees(value: number): number {
    return Number((value / 100).toFixed(2));
}



function productSlugToCode(slug: string): string {
    return slug
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6)
}

function normalizePart(value: string, maxLength: number): string {
    return value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, maxLength)
}