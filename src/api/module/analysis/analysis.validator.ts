import { z } from "zod";

const rangeEnum = ["7d", "30d", "90d", "180d"] as const;
export const rangeValues = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "180d": 180,
}

export const revenueAnalysisQuerySchema = z.object({
    range: z.enum(rangeEnum).default("30d"),
});

export const statusAnalysisQuerySchema = z.object({
    type: z.enum(["order", "payment"]).default("order"),
})


export type RevenueAnalysisQuery = z.infer<typeof revenueAnalysisQuerySchema>;
export type StatusAnalysisQuery = z.infer<typeof statusAnalysisQuerySchema>;