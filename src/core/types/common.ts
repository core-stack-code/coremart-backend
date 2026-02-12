export type ClientType = 'web' | 'mobile';

export type DeviceInfo = {
    ip?: string;
    userAgent?: string;
}

export type TokensResponse = {
    accessToken: string;
    refreshToken: string;
}

export type PaginationType = {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    isPrevPage: boolean;
    isNextPage: boolean;
}