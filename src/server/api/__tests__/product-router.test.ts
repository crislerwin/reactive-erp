import { describe, expect, it } from "vitest";
import { makeApp, makeSut } from "./__mocks__";
import { faker } from "@faker-js/faker";
import { prisma } from "@/server/db";
import { ErrorType } from "../../../common/errors";
import { prepareJsonForTest } from "./__mocks__/test-helpers";

describe.concurrent("Product Router", () => {
  describe("GET all products", () => {
    it("should return all products", async () => {
      const branch = await prisma.branch.create({
        data: {
          name: "Test Branch",
        },
      });
      const staff = await prisma.staff.create({
        data: {
          active: true,
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "ADMIN",
        },
      });

      const app = await makeApp({
        branch_id: branch.branch_id,
        staff,
      });
      const productCategory = await prisma.productCategory.create({
        data: {
          active: true,
          branch_id: branch.branch_id,
          name: "Test Category",
        },
      });
      await prisma.product.createMany({
        data: Array.from({ length: 10 }, () => ({
          available: true,
          branch_id: branch.branch_id,
          colors: prepareJsonForTest(["red", "blue"]),
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: productCategory.id,
          stock: faker.datatype.number(),
        })),
      });
      const products = await app.product.findAll();

      expect(products).toHaveLength(10);
    });
    it("should return an error if the user branch is invalid", async () => {
      const app = await makeApp({
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
    it("should return all products from the user branch", async () => {
      const { branch, productCategory } = await makeSut();
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
      const app = await makeApp({
        branch_id: branch.branch_id,
        staff,
      });
      const createManyProducts = await prisma.product.createMany({
        data: Array.from({ length: 10 }, () => ({
          available: true,
          branch_id: branch.branch_id,
          colors: prepareJsonForTest(["red", "blue"]),
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: productCategory.id,
          stock: faker.datatype.number(),
        })),
      });
      const products = await app.product.findAll();
      expect(products).toHaveLength(createManyProducts.count);
    });
  });
  describe("Create a product", () => {
    it("should create a product", async () => {
      const { app, productCategory } = await makeSut();
      const product = await app.product.create({
        available: "true",
        colors: ["red", "blue"],
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: productCategory.id,
        stock: faker.datatype.number().toString(),
      });
      expect(product).toBeTruthy();
    });
    it("should return an error if the user is not authorized", async () => {
      const { branch, productCategory } = await makeSut();
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
      const app = await makeApp({
        branch_id: branch.branch_id,
        staff,
      });
      const promisses = app.product.create({
        available: "true",
        colors: ["red", "blue"],
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: productCategory.id,
        stock: faker.datatype.number().toString(),
      });
      await expect(promisses).rejects.toThrowError("UNAUTHORIZED");
    });
    it("should throw if try to create a product with invalid product_category_id", async () => {
      const { app } = await makeSut();
      const promisses = app.product.create({
        available: "true",
        colors: ["red", "blue"],
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: faker.datatype.number(),
        stock: faker.datatype.number().toString(),
      });
      await expect(promisses).rejects.toThrowError(
        ErrorType.PRODUCT_CATEGORY_NOT_FOUND
      );
    });
  });
  describe("Update Product", () => {
    it("should update a product", async () => {
      const { app, branch, productCategory } = await makeSut();
      const product = await prisma.product.create({
        data: {
          available: true,
          branch_id: branch.branch_id,
          colors: prepareJsonForTest(["red", "blue"]),
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: productCategory.id,
          stock: faker.datatype.number(),
        },
      });
      const updatedProduct = await app.product.updateProduct({
        product_id: String(product.product_id),
        available: "true",
        colors: ["red", "blue"],
        description: faker.lorem.sentence(),
        name: faker.commerce.productName(),
        price: faker.commerce.price(),
        product_category_id: productCategory.id,
        stock: faker.datatype.number().toString(),
      });
      expect(updatedProduct).toBeTruthy();
      expect(updatedProduct.product_id).toBe(product.product_id);
    });
  });
  describe("Delete Product", () => {
    it("should delete a product", async () => {
      const { app, branch, productCategory } = await makeSut();
      const product = await prisma.product.create({
        data: {
          available: true,
          branch_id: branch.branch_id,
          colors: prepareJsonForTest(["red", "blue"]),
          description: faker.lorem.sentence(),
          name: faker.commerce.productName(),
          price: Number(faker.commerce.price()),
          product_category_id: productCategory.id,
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
