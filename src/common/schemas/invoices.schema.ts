import { z } from "zod";
import { customNumberValidator } from "./common";

export const createInvoiceSchema = z.object({
  staff_id: customNumberValidator,
  customer_id: customNumberValidator,
  items: z.array(
    z.object({
      product_id: customNumberValidator,
      quantity: customNumberValidator,
    })
  ),
  expires_at: z.string(),
  status: z.enum(["pending", "paid", "draft"]).optional(),
});

export const updateInvoiceSchema = z.object({
  id: customNumberValidator,
  staff_id: customNumberValidator.optional(),
  customer_id: customNumberValidator.optional(),
  items: z.array(
    z.object({
      product_id: customNumberValidator,
      quantity: customNumberValidator,
    })
  ),
  expires_at: z.string().optional(),
  status: z.enum(["pending", "paid", "draft"]).optional(),
});
