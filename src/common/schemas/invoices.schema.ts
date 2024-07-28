import { z } from "zod";
import { customNumberValidator } from "./common";

const customDateValidator = z
  .string()
  .refine((data) => {
    return !isNaN(Date.parse(data));
  })
  .transform((data) => {
    return new Date(data).toISOString();
  });

const invoiceItemSchema = z.object({
  product_id: customNumberValidator,
  quantity: customNumberValidator,
});

export const createInvoiceSchema = z.object({
  staff_id: customNumberValidator,
  customer_id: customNumberValidator,
  items: z.array(invoiceItemSchema),
  expires_at: customDateValidator,
  status: z.enum(["pending", "paid", "draft", "canceled"]).optional(),
});

export const updateInvoiceSchema = z.object({
  id: customNumberValidator,
  staff_id: customNumberValidator.optional(),
  customer_id: customNumberValidator.optional(),
  items: z.array(invoiceItemSchema),
  expires_at: customDateValidator.optional(),
  status: z.enum(["pending", "paid", "draft"]).optional(),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
