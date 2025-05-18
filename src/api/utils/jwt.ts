import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

export const generateJwtToken = (
    keyObject: string | object | Buffer,
    key: Secret,
    expiryTime: number | `${number}${'s' | 'm' | 'h' | 'd'}`
): string => {
    return jwt.sign(keyObject, key, { expiresIn: expiryTime });
};

export const verifyJwtToken = (
    token: string,
    secret: Secret
): JwtPayload | null => {
    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
};