import { prisma } from "@/server/db";
import { makeApp, makeSut } from "./__mocks__";
import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { type z } from "zod";
import { type createCustomerSchema } from "../../../common/schemas";

describe("Customer Router", () => {
  describe("List all routers", () => {
    it.skip("should return empty if no customer is saved", async () => {
      const { app } = await makeSut();
      const customers = await app.customer.findAll();
      expect(customers).toEqual([]);
    });
    it.skip("should return saved customers", async () => {
      const { app, branch } = await makeSut();
      const customersData = Array.from({ length: 5 }, () => ({
        branch_id: branch.branch_id,
        customer_code: faker.datatype.number(),
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        last_name: faker.name.lastName(),
        phone: faker.phone.number(),
      }));
      const customers = await prisma.customer.createMany({
        data: customersData,
      });

      const result = await app.customer.findAll();
      expect(result.length).toEqual(customers.count);
    });
    it("should throw if get to get a customers of another branch", async () => {
      const app = await makeApp({ branch_id: faker.datatype.number() });
      const customersData = Array.from({ length: 5 }, () => ({
        branch_id: faker.datatype.number(),
        customer_code: faker.datatype.number(),
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        last_name: faker.name.lastName(),
        phone: faker.phone.number(),
      }));
      await prisma.customer.createMany({
        data: customersData,
      });
      const promise = app.customer.findAll();
      await expect(promise).rejects.toThrow();
    });
  });
  describe("Create Customer", () => {
    it("Should create a customer successfully", async () => {
      const { app } = await makeSut();
      const customerPayload: z.infer<typeof createCustomerSchema> = {
        customer_code: faker.datatype.number(),
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        last_name: faker.name.lastName(),
        phone: faker.phone.number(),
      };
      const customer = await app.customer.create(customerPayload);
      const createdCustomer = await prisma.customer.findUnique({
        where: { customer_id: customer.customer_id },
      });
      expect(createdCustomer?.last_name).toEqual(customerPayload.last_name);
      expect(createdCustomer?.first_name).toEqual(customerPayload.first_name);
      expect(createdCustomer?.email).toEqual(customerPayload.email);
    });
  });
  describe("Update Customer", () => {
    it("Should update customer successfuly", async () => {
      const { app } = await makeSut();
      const customerPayload: z.infer<typeof createCustomerSchema> = {
        customer_code: faker.datatype.number(),
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        last_name: faker.name.lastName(),
        phone: faker.phone.number(),
      };
      const customer = await app.customer.create(customerPayload);
      const createdCustomer = await prisma.customer.findUnique({
        where: { customer_id: customer.customer_id },
      });
      expect(createdCustomer?.last_name).toEqual(customerPayload.last_name);
      expect(createdCustomer?.first_name).toEqual(customerPayload.first_name);
      expect(createdCustomer?.email).toEqual(customerPayload.email);
      const newCustomerName = faker.name.firstName();
      const updatedCustomer = await app.customer.update({
        customer_id: customer.customer_id,
        first_name: newCustomerName,
      });
      expect(updatedCustomer.first_name).toEqual(newCustomerName);
    });
  });
  describe("Delete Customer", () => {
    it("Should delete a customer", async () => {
      const { app } = await makeSut();
      const customerPayload: z.infer<typeof createCustomerSchema> = {
        customer_code: faker.datatype.number(),
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        last_name: faker.name.lastName(),
        phone: faker.phone.number(),
      };
      const customer = await app.customer.create(customerPayload);
      const createdCustomer = await prisma.customer.findUnique({
        where: { customer_id: customer.customer_id },
      });
      expect(createdCustomer?.last_name).toEqual(customerPayload.last_name);
      expect(createdCustomer?.first_name).toEqual(customerPayload.first_name);
      await app.customer.delete({
        customer_id: customer.customer_id,
      });
      const deletedCustomer = await prisma.customer.findUnique({
        where: { customer_id: customer.customer_id },
      });
      expect(deletedCustomer?.deleted_at).not.toBeNull();
    });
  });
});
