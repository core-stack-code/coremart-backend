import { OrderStatus, PaymentStatus } from "generated/prisma/enums"
import { getMonthsDate, getSubDateRange } from "@core/lib/dateFns"
import { analysisRepository } from "./analysis.repository"
import { rangeValues, RevenueAnalysisQuery, StatusAnalysisQuery } from "./analysis.validator"

import { attributesRepository } from "@mod/attributes/attributes.repository"
import { brandRepository } from "@mod/brand/brand.repository"
import { userRepository } from "@mod/users/user.repository"
import { catalogRepository } from "@mod/catalog/catalog.repository"
import { orderRepository } from "@mod/order/order.repository"
import { variantsRepository } from "@mod/variants/variants.repository"
import { orderManagmentRepository } from "@mod/order-management/orderManagment.repository"


class AnalysisService {
    public async getOverviewMatrix() {
        const { startOfCurrentMonth, endOfCurrentMonth, startOfLastMonth, endOfLastMonth } = getMonthsDate()

        const [ 
            totalCustomers,
            currentMonthCustomers,
            lastMonthCustomers,
            totalProducts,
            totalActiveVarinats,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalRevenueResult,
            curentMonthRevenueResult,
            lastMonthRevenueResult
        ] = await Promise.all([
            userRepository.count(),

            userRepository.count({
                createdAt: {
                    gte: startOfCurrentMonth,
                    lte: endOfCurrentMonth
                }
            }),

            userRepository.count({
                createdAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            }),


            catalogRepository.countProducts({
                status: "ACTIVE",
            }),

            variantsRepository.count({
                sku: {
                    isActive: true
                }
            }),

            orderRepository.countOrders(),

            orderRepository.countOrders({
                status: "PENDING",
            }),

            orderRepository.countOrders({
                status: {
                    in: ["CONFIRMED", "SHIPPED", "DELIVERED"],
                }
            }),
            
            orderManagmentRepository.totalRevenue(),
            orderManagmentRepository.totalRevenue(startOfCurrentMonth, endOfCurrentMonth),
            orderManagmentRepository.totalRevenue(startOfLastMonth, endOfLastMonth)
        ])

        // for reventue calculation
        const percentageRevenueChange = this.getPerventageChange(
            curentMonthRevenueResult._sum.totalAmount ?? 0,
            lastMonthRevenueResult._sum.totalAmount ?? 0
        )

        // for customer change
        const percentageCustomerChange = this.getPerventageChange(
            currentMonthCustomers,
            lastMonthCustomers
        )
        
    

        return {
            customers: {
                total: totalCustomers,
                percentageChange: percentageCustomerChange
            },
            inventory: {
                totalProducts,
                totalActiveVarinats,
            },
            orders: {
                totalOrders,
                pendingOrders,
                completedOrders,
            },
            revenue: {
                total: totalRevenueResult._sum.totalAmount ?? 0,
                percentageChange: percentageRevenueChange,
            }
        }
    }

    public async getBrandAtrributeCount() {
        const [ brands, sizes, colors, materials ] = await Promise.all([
            brandRepository.count(),
            attributesRepository.sizeCount(),
            attributesRepository.colorCount(),
            attributesRepository.materialCount()
        ])

        return { brands, sizes, colors, materials }
    }

    public async getRevenueAnalysis(query: RevenueAnalysisQuery) {
        const startDate = getSubDateRange(rangeValues[query.range])

        const revenue = await analysisRepository.revenueAnalysis(startDate) as any

        return revenue.map((r: any) => ({
            date: r.date,
            revenue: Number(r.revenue)
        }))
    }

    public async getStatusAnalysis(query: StatusAnalysisQuery) {
        if (query.type === "order") {
            const result = await orderManagmentRepository.groupByOrderStatus()

            const formattedResult: Record<OrderStatus, number> = {
                CANCELLED: 0,
                CONFIRMED: 0,
                DELIVERED: 0,
                EXPIRED: 0,
                PENDING: 0,
                SHIPPED: 0
            }

            result.forEach((item) => {
                formattedResult[item.status] = item._count.status
            })

            return formattedResult;
        }

        const result = await orderManagmentRepository.groupByPaymentStatus()
        
        const formattedResult: Record<PaymentStatus, number> = {
            ACTIVE: 0,
            EXPIRED: 0,
            PAID: 0
        }

        result.forEach((item) => {
            formattedResult[item.cfStatus] = item._count.cfStatus
        })

        return formattedResult;
    }

    



    private getPerventageChange(currentValue: number, lastValue: number) {
        let change = 0;

        if (lastValue > 0) {
            change = ((currentValue - lastValue) / lastValue) * 100;
        }

        if (lastValue === 0) {
            change = currentValue > 0 ? 100 : 0;
        }

        return change;
    }
}

export const analysisService = new AnalysisService()