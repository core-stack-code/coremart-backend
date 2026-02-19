import z from "zod";
import { mobileSchema } from "@core/validator/mobile.validator";
import { createAddressSchema } from "@mod/address/address.validator";


export const checkoutSchema = z.object({
    customer: z.object({
        name: z.string().trim().min(1, "Name is required"),
        mobile: mobileSchema,
    }),

    note: z
        .string()
        .trim()
        .min(5, "Note must be at least 5 characters long")
        .max(500, "Note must be at most 500 characters long")
        .optional(),

    addressId: z.string().trim().min(1, "Invalid address ID").nullable(),
    newAddress: createAddressSchema.nullable(),

    isSaveAddress: z.boolean(),

})
.superRefine((data, ctx) => {
  const hasAddressId = !!data.addressId;
  const hasNewAddress = !!data.newAddress;

  if (hasAddressId && hasNewAddress) {
    ctx.addIssue({
      code: "custom",
      message: "Provide either addressId or newAddress, not both",
    });
  }

  if (!hasAddressId && !hasNewAddress) {
    ctx.addIssue({
      code: "custom",
      message: "Either addressId or newAddress must be provided",
    });
  }
});

export type CheckoutPayload = z.infer<typeof checkoutSchema>;