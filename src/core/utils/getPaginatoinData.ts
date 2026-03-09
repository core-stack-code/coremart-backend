import { PaginationType } from "@core/types/common";

export const getPaginationData = (page: number, limit: number, total: number): PaginationType => {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        totalPages,
        totalItems: total,
        isPrevPage: page > 1,
        isNextPage: page < totalPages,
    };
}