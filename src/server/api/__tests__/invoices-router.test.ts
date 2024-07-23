import { type z } from "zod";
import { type createInvoiceSchema } from "@/common/schemas";

import { describe, expect, test } from "vitest";
import { makeSut } from "./__mocks__";
import { faker } from "@faker-js/faker";
describe("Invoices Router", () => {
  describe("Invoices creation", () => {
    test("Should create a invoice", async () => {
      const { app, productCategory, branch } = await makeSut();
      const customer = await app.customer.create({
        email: faker.internet.email(),
        first_name: faker.name.firstName(),
        customer_code: 1,
      });
      const staff = await app.staff.createStaffMember({
        email: faker.internet.email(),
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        role: "EMPLOYEE",
      });
      const [product1, product2] = await Promise.all([
        app.product.create({
          name: faker.commerce.productName(),
          price: 10,
          stock: 10,
          product_category_id: productCategory.id,
        }),
        app.product.create({
          name: faker.commerce.productName(),
          price: 30,
          stock: 10,
          product_category_id: productCategory.id,
        }),
      ]);

      const invoicePayload: z.infer<typeof createInvoiceSchema> = {
        customer_id: customer.customer_id,
        staff_id: staff.id,
        expires_at: faker.date.future().toISOString(),
        items: [
          {
            product_id: product1.product_id,
            quantity: 1,
          },
          {
            product_id: product2.product_id,
            quantity: 2,
          },
        ],
      };
      const response = await app.invoice.create(invoicePayload);
      expect(response.total_items).toBe(3);
      expect(response.total_price).toBe(70);
    });
    test("should throw if try to create with invalid producs", async () => {
      const { app, productCategory, branch } = await makeSut();
      const customer = await app.customer.create({
        email: faker.internet.email(),
        first_name: faker.name.firstName(),
        customer_code: 1,
      });
      const staff = await app.staff.createStaffMember({
        email: faker.internet.email(),
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        role: "EMPLOYEE",
      });
      const product = await app.product.create({
        name: faker.commerce.productName(),
        price: 10,
        stock: 10,
        product_category_id: productCategory.id,
      });
      const invoicePayload: z.infer<typeof createInvoiceSchema> = {
        customer_id: customer.customer_id,
        staff_id: staff.id,
        expires_at: faker.date.future().toISOString(),
        items: [
          {
            product_id: product.product_id,
            quantity: 1,
          },
          {
            product_id: faker.datatype.number(),
            quantity: 2,
          },
        ],
      };
      const response = app.invoice.create(invoicePayload);
      await expect(response).rejects.toThrow();
    });
  });
});
