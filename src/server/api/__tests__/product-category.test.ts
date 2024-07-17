import { describe, expect, it } from "vitest";
import { makeSut } from "./__mocks__";
import { prisma } from "@/server/db";

describe.concurrent("Product Category CRUD", () => {
  describe("Product_Category ListAll", () => {
    it("should return a list of product categories", async () => {
      const { app, branch } = await makeSut();
      await prisma.productCategory.create({
        data: {
          branch_id: branch.branch_id,
          name: "Test Category",
          active: true,
        },
      });
      const productCategories = await app.productCategory.findAll();
      expect(productCategories.length).toBe(1);
    });
    it("should return an empty list if no product categories are found", async () => {
      const { app } = await makeSut();
      const productCategories = await app.productCategory.findAll();
      expect(productCategories.length).toBe(0);
    });
  });
  describe("Product_Category Create", () => {
    it("should create a product category", async () => {
      const { app } = await makeSut();
      const productCategory = await app.productCategory.createCategory({
        name: "Test Category",
        active: true,
      });
      expect(productCategory.name).toBe("Test Category");
      expect(productCategory.active).toBe(true);
      const productCategories = await app.productCategory.findAll();
      expect(productCategories.length).toBe(1);
    });
    it("should not create a product category if the name is empty", async () => {
      const { app } = await makeSut();
      const promisse = app.productCategory.createCategory({
        name: "",
        active: true,
      });
      await expect(promisse).rejects.toThrowError();
    });
  });
  describe("ProductCategory Update", () => {
    it("should update a product category", async () => {
      const { app, branch } = await makeSut();
      const productCategory = await prisma.productCategory.create({
        data: {
          branch_id: branch.branch_id,
          name: "Test Category",
          active: true,
        },
      });
      const updatedProductCategory = await app.productCategory.updateCategory({
        id: productCategory.id,
        name: "Updated Category",
        active: false,
      });
      expect(updatedProductCategory.name).toBe("Updated Category");
      expect(updatedProductCategory.active).toBe(false);
    });
    it("should not update a product category if the name is empty", async () => {
      const { app, branch } = await makeSut();
      const productCategory = await prisma.productCategory.create({
        data: {
          branch_id: branch.branch_id,
          name: "Test Category",
          active: true,
        },
      });
      const promisse = app.productCategory.updateCategory({
        id: productCategory.id,
        name: "",
        active: false,
      });
      await expect(promisse).rejects.toThrowError();
    });
    it("should update product availability", async () => {
      const { app, branch } = await makeSut();
      const productCategory = await prisma.productCategory.create({
        data: {
          branch_id: branch.branch_id,
          name: "Test Category",
          active: true,
        },
      });
      const updatedProductCategory = await app.productCategory.updateCategory({
        id: productCategory.id,
        active: false,
      });
      expect(updatedProductCategory.active).toBe(false);
      const productCategories = await app.productCategory.findAll();
      expect(productCategories.length).toBe(1);
      expect(productCategories?.[0]?.active).toBe(false);
    });
  });
  describe("ProductCategory DELETE", () => {
    it("should delete a product category", async () => {
      const { app } = await makeSut();
      const productCategory = await app.productCategory.createCategory({
        name: "Test Category",
        active: true,
      });
      const deletedProductCategory = await app.productCategory.deleteCategory({
        id: productCategory.id,
      });
      expect(deletedProductCategory).toBeTruthy();
      const productCategories = await app.productCategory.findAll();
      expect(productCategories.length).toBe(0);
    });
  });
});
