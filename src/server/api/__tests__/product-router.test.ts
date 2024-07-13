import { beforeAll, describe, expect, it, test } from "vitest";
import { makeApp, makeStaffRequest, makeSut } from "./__mocks__";
import { type createProductSchema } from "@/common/schemas";
import { type z } from "zod";
import { faker } from "@faker-js/faker";
import { prisma } from "@/server/db";
import { after } from "node:test";

const manyProducs: z.infer<typeof createProductSchema>[] = Array.from(
  { length: 10 },
  () => ({
    available: true,
    branch_id: 1,
    colors: ["red", "blue"],
    currency: "USD",
    description: faker.lorem.sentence(),
    name: faker.commerce.productName(),
    price: Number(faker.commerce.price()),
    product_category_id: 1,
    stock: faker.datatype.number(),
  })
);
describe("Product Router", () => {
  beforeAll(async () => {
    await prisma.product.deleteMany();
  });

  describe("GET all products", () => {
    it("should return all products", async () => {
      const { app, branch } = await makeSut();
      const createManyProducts = await prisma.product.createMany({
        data: manyProducs.map((product) => ({
          ...product,
          branch_id: branch.branch_id,
        })),
      });
      const products = await app.product.findAll();
      expect(products).toHaveLength(createManyProducts.count);
    });
    test("should return an error if the user branch is invalid", async () => {
      const app = makeApp({
        branch_id: faker.datatype.number(),
        staff: {
          active: true,
          id: faker.datatype.number(),
          branch_id: faker.datatype.number(),
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });

      const promisses = app.product.findAll();
      await expect(promisses).rejects.toThrowError("Branch not found");
    });
    test("should return all products from the user branch", async () => {
      const { branch } = await makeSut();
      const staff = await prisma.staff.create({
        data: {
          active: true,
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const app = makeApp({
        branch_id: branch.branch_id,
        staff,
      });
      const createManyProducts = await prisma.product.createMany({
        data: manyProducs.map((product) => ({
          ...product,
          branch_id: branch.branch_id,
        })),
      });
      const products = await app.product.findAll();
      expect(products).toHaveLength(createManyProducts.count);
    });
  });
  describe("Create a product", () => {
    it("should create a product", async () => {
      const { app, branch } = await makeSut();
      const product = await app.product.create({
        available: "true",
        colors: ["red", "blue"],
        currency: "USD",
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: "1",
        stock: faker.datatype.number().toString(),
      });
      expect(product).toBeTruthy();
    });
    it("should return an error if the user is not authorized", async () => {
      const { branch } = await makeSut();
      const staff = await prisma.staff.create({
        data: {
          active: true,
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const app = makeApp({
        branch_id: branch.branch_id,
        staff,
      });
      const promisses = app.product.create({
        available: "true",
        colors: ["red", "blue"],
        currency: "USD",
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: "1",
        stock: faker.datatype.number().toString(),
      });
      await expect(promisses).rejects.toThrowError("UNAUTHORIZED");
    });
  });
  describe("Update Product", () => {
    it("should update a product", async () => {
      const { app, branch } = await makeSut();
      const product = await prisma.product.create({
        data: {
          available: true,
          branch_id: branch.branch_id,
          colors: ["red", "blue"],
          currency: "USD",
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: 1,
          stock: faker.datatype.number(),
        },
      });
      const updatedProduct = await app.product.updateProduct({
        product_id: String(product.product_id),
        available: "true",
        colors: ["red", "blue"],
        currency: "USD",
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: "1",
        stock: faker.datatype.number().toString(),
      });
      expect(updatedProduct).toBeTruthy();
    });
  });
  describe("Delete Product", () => {
    it("should delete a product", async () => {
      const { app, branch } = await makeSut();
      const product = await prisma.product.create({
        data: {
          available: true,
          branch_id: branch.branch_id,
          colors: ["red", "blue"],
          currency: "USD",
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: 1,
          stock: faker.datatype.number(),
        },
      });
      const deletedProduct = await app.product.deleteProduct({
        product_id: product.product_id,
      });
      expect(deletedProduct).toBeTruthy();
    });
  });
});
