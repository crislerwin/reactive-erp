import { type z } from "zod";
import { type createInvoiceSchema } from "@/common/schemas";
import { describe, expect, test } from "vitest";
import { createBranch, createStaffMember, makeApp, makeSut } from "./__mocks__";
import { faker } from "@faker-js/faker";
import { prisma } from "../../db";
import { ErrorType } from "@/common/errors";

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
        type: "sale",
        status: "draft",
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
    });
    test("should throw if try to create invoice with invalid products", async () => {
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
        type: "sale",
        status: "draft",
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
      await expect(response).rejects.toThrowError(
        ErrorType.PRODUCT_QUANTITY_MISMATCH
      );
    });
  });
  describe("GET invoices", () => {
    describe("Get All invoices", () => {
      test("should get all invoices successfully", async () => {
        const branch = await prisma.branch.create({
          data: {
            name: faker.company.name(),
          },
        });
        const staff = await prisma.staff.create({
          data: {
            branch_id: branch.branch_id,
            email: faker.internet.email(),
            first_name: faker.name.firstName(),
            role: "ADMIN",
          },
        });
        const productCategory = await prisma.productCategory.create({
          data: {
            name: faker.commerce.department(),
            branch_id: branch.branch_id,
          },
        });
        const app = await makeApp({ branch_id: branch.branch_id, staff });
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
        const customer = await app.customer.create({
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          customer_code: 1,
        });

        const invoicePayload: z.infer<typeof createInvoiceSchema> = {
          customer_id: customer.customer_id,
          staff_id: staff.id,
          expires_at: faker.date.future().toISOString(),
          type: "sale",
          status: "draft",
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
        await app.invoice.create(invoicePayload);

        const invoices = await app.invoice.getAll();
        expect(invoices).toHaveLength(1);
        expect(invoices?.[0]?.total_items).toBe(3);
      });
      test("should throw if try to get all invoices without permission", async () => {
        const staff = await prisma.staff.create({
          data: {
            branch_id: 1,
            email: faker.internet.email(),
            first_name: faker.name.firstName(),
            role: "EMPLOYEE",
          },
        });

        const app = await makeApp({ branch_id: 1, staff });
        const response = app.invoice.getAll();
        expect(await response).toEqual([]);
      });
    });
  });
  describe("Update invoice", () => {
    test("should change invoice status of draft to pending", async () => {
      const { app, branch, productCategory } = await makeSut();
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
        type: "sale",
        status: "draft",
        expires_at: faker.date.future().toISOString(),
        items: [
          {
            product_id: product.product_id,
            quantity: 1,
          },
        ],
      };
      const createdInvoice = await app.invoice.create(invoicePayload);
      const updatedInvoice = await app.invoice.update({
        id: createdInvoice.id,
        status: "pending",
        items: invoicePayload.items,
      });
      expect(updatedInvoice.status).toBe("pending");
    });
  });
  describe("Delete invoice", () => {
    test("should delete invoice successfully", async () => {
      const branch = await createBranch();
      const [adminStaff, employeeStaff] = await Promise.all([
        createStaffMember(branch.branch_id, "ADMIN"),
        createStaffMember(branch.branch_id, "EMPLOYEE"),
      ]);
      const app = await makeApp({
        branch_id: branch.branch_id,
        staff: adminStaff,
      });

      const productCategory = await prisma.productCategory.create({
        data: {
          name: faker.commerce.department(),
          branch_id: branch.branch_id,
        },
      });
      const customer = await app.customer.create({
        email: faker.internet.email(),
        first_name: faker.name.firstName(),
        customer_code: 1,
      });

      const product = await app.product.create({
        name: faker.commerce.productName(),
        price: 10,
        stock: 10,
        product_category_id: productCategory.id,
      });

      const invoicePayload: z.infer<typeof createInvoiceSchema> = {
        customer_id: customer.customer_id,
        staff_id: employeeStaff.id,
        type: "sale",
        status: "draft",
        expires_at: faker.date.future().toISOString(),
        items: [
          {
            product_id: product.product_id,
            quantity: 1,
          },
        ],
      };
      const createdInvoice = await app.invoice.create(invoicePayload);
      await app.invoice.delete({ id: createdInvoice.id });
      const invoices = await app.invoice.getAll();
      expect(invoices).toHaveLength(0);
    });
  });
});
