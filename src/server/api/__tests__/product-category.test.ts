import { describe, expect, it } from "vitest";
import { makeSut } from "./__mocks__";
import { prisma } from "@/server/db";

describe("Product Category CRUD", () => {
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
});
