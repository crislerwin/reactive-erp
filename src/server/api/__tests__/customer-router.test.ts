import { prisma } from "@/server/db";
import { makeApp, makeSut } from "./__mocks__";
import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";

describe("Customer Router", () => {
  describe("List all routers", () => {
    it("should return empty if no customer is saved", async () => {
      const { app } = await makeSut();
      const customers = await app.customer.findAll();
      expect(customers).toEqual([]);
    });
    it("should return saved customers", async () => {
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
});
