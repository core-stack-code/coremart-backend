import { prisma } from "@core/config/prisma"

class AnalysisRepository {
    public async revenueAnalysis(startDate: Date) {
        return await prisma.$queryRaw`
            SELECT
                DATE("createdAt") as date,
                SUM("totalAmount") as revenue
            FROM "Order"
            WHERE
                "status" IN ('CONFIRMED','SHIPPED','DELIVERED')
                AND "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY DATE("createdAt") ASC
        `
    }
}

export const analysisRepository = new AnalysisRepository()