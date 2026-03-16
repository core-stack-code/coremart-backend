import z from "zod";
import { BenefitType, DiscountType } from "generated/prisma/enums";
import { pageQuery, limitQuery } from "@core/validator/common.validator";

const discountEnum: DiscountType[] = ["AUTOMATIC", "COUPON"] as const;
const benefitesEnum: BenefitType[] = ["FIXED_AMOUNT", "PERCENTAGE"] as const;

const discountBaseShape = {
    name: z.string().trim().min(3).max(100),
    type: z.enum(discountEnum),
    benefitType: z.enum(benefitesEnum),
    code: z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[A-Z0-9_]+$/, "Code must be uppercase alphanumeric")
        .optional()
        .nullable(),
    benefitValue: z.number().int().positive(),
    maxDiscount: z.number().int().positive().optional().nullable(),
    minOrderAmount: z.number().int().nonnegative().optional().nullable(),
    usageLimit: z.number().int().positive().optional().nullable(),
    startsAt: z.coerce.date().optional().nullable(),
    endsAt: z.coerce.date().optional().nullable(),
};

const discountRefinement = (data: {
    type?: DiscountType;
    benefitType?: BenefitType;
    benefitValue?: number;
    code?: string | null;
    usageLimit?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
}, ctx: z.RefinementCtx) => {
    if (data.type === "AUTOMATIC") {
        if (!data.startsAt) {
            ctx.addIssue({ code: "custom", message: "startsAt is required for AUTOMATIC promotions", path: ["startsAt"] });
        }
        if (!data.endsAt) {
            ctx.addIssue({ code: "custom", message: "endsAt is required for AUTOMATIC promotions", path: ["endsAt"] });
        }
        if (data.code) {
            ctx.addIssue({ code: "custom", message: "AUTOMATIC promotion cannot have a code", path: ["code"] });
        }
        if (data.usageLimit) {
            ctx.addIssue({ code: "custom", message: "AUTOMATIC promotion cannot have usageLimit", path: ["usageLimit"] });
        }
    }

    if (data.type === "COUPON") {
        if (!data.code) {
            ctx.addIssue({ code: "custom", message: "code is required for COUPON promotions", path: ["code"] });
        }
        if (!data.usageLimit) {
            ctx.addIssue({ code: "custom", message: "usageLimit is required for COUPON promotions", path: ["usageLimit"] });
        }
    }

    if (data.benefitType === "PERCENTAGE" && data.benefitValue !== undefined) {
        if (data.benefitValue > 100) {
            ctx.addIssue({ code: "custom", message: "Percentage cannot exceed 100", path: ["benefitValue"] });
        }
    }

    if (data.startsAt && data.endsAt) {
        if (data.endsAt <= data.startsAt) {
            ctx.addIssue({ code: "custom", message: "endsAt must be after startsAt", path: ["endsAt"] });
        }
    }
};

export const createDiscountSchema = z
    .object({
        ...discountBaseShape,
        productIds: z.array(z.uuid()).optional().nullable(),
        categoryIds: z.array(z.uuid()).optional().nullable(),
    })
    .superRefine(discountRefinement);

const discountUpdateShape = {
    name: discountBaseShape.name.optional(),
    type: discountBaseShape.type.optional(),
    benefitType: discountBaseShape.benefitType.optional(),
    code: discountBaseShape.code,
    benefitValue: discountBaseShape.benefitValue.optional(),
    maxDiscount: discountBaseShape.maxDiscount,
    minOrderAmount: discountBaseShape.minOrderAmount,
    usageLimit: discountBaseShape.usageLimit,
    startsAt: discountBaseShape.startsAt,
    endsAt: discountBaseShape.endsAt,
    isActive: z.boolean().optional(),
};

export const updateDiscountSchema = z
    .object(discountUpdateShape)
    .superRefine(discountRefinement);

export const replaceScopeSchema = z.object({
    productIds: z.array(z.uuid()).optional(),
    categoryIds: z.array(z.uuid()).optional(),
});

export const discountListQuerySchema = z.object({
    page: pageQuery,
    limit: limitQuery(10, 50),
    type: z.enum(discountEnum).optional(),
    isActive: z
        .enum(["true", "false"])
        .transform((val) => val === "true")
        .optional(),
});

export type CreateDiscountPayload = z.infer<typeof createDiscountSchema>;
export type UpdateDiscountPayload = z.infer<typeof updateDiscountSchema>;
export type ReplaceScopePayload = z.infer<typeof replaceScopeSchema>;
export type DiscountListQuery = z.infer<typeof discountListQuerySchema>;