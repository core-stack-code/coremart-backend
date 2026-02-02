export type ClientType = 'web' | 'mobile';

export type DeviceInfo = {
    ip?: string;
    userAgent?: string;
}

export type TokensResponse = {
    accessToken: string;
    refreshToken: string;
}