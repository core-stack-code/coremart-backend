export const generateOTP = (): number => {
    return Math.floor(100000 + Math.random() * 900000);
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}