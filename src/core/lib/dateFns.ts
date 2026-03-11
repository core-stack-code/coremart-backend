import { endOfMonth, startOfMonth, subDays, subMonths } from "date-fns";

export const getMonthsDate = () => {
    const now = new Date();

    const startOfCurrentMonth = startOfMonth(now)
    const endOfCurrentMonth = endOfMonth(now)

    const lastMonthDate = subMonths(now, 1)

    const startOfLastMonth = startOfMonth(lastMonthDate)
    const endOfLastMonth = endOfMonth(lastMonthDate)

    return {
        startOfCurrentMonth,
        endOfCurrentMonth,
        startOfLastMonth,
        endOfLastMonth,
    }
}

export const getSubDateRange = (range: number) => {
    return subDays(new Date(), range)
}