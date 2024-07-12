import { describe, it, expect } from "vitest";
import { makeApp, makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";

describe("Branch router", () => {
  describe("List all branches", () => {
    it("should return all branches", async () => {
      const { app } = await makeSut();
      const allCreatedBranches = await prisma.branch.findMany();
      const branches = await app.branch.findAll();
      expect(branches).toHaveLength(allCreatedBranches.length);
    });
    it("should return an error if the user is not allowed to perform this action", async () => {
      const app = makeApp({
        branch_id: 1,
        staff: {
          active: true,
          id: 1,
          branch_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const promisses = app.branch.findAll();
      await expect(promisses).rejects.toThrowError(
        "You are not allowed to perform this action"
      );
    });
  });
  describe("CREATE branch", () => {
    it("should create a new branch", async () => {
      const { app } = await makeSut();
      const branch = await app.branch.createBranch({
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.email(),
        logo_url: faker.image.imageUrl(),
        attributes: {
          test: "test",
        },
      });
      expect(branch).toHaveProperty("branch_id");
      expect(branch).toHaveProperty("name");
      expect(branch).toHaveProperty("company_code");
      expect(branch).toHaveProperty("website");
      expect(branch).toHaveProperty("logo_url");
      expect(branch).toHaveProperty("created_at");
      expect(branch).toHaveProperty("updated_at");
      expect(branch).toHaveProperty("deleted_at");
      expect(branch).toHaveProperty("attributes");
    });
    it("should return an error if the user is not allowed to perform this action", async () => {
      const app = makeApp({
        branch_id: 1,
        staff: {
          active: true,
          id: 1,
          branch_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const promisses = app.branch.createBranch({
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.email(),
        logo_url: faker.image.imageUrl(),
        attributes: {
          test: "test",
        },
      });
      await expect(promisses).rejects.toThrowError(
        "You are not allowed to perform this action"
      );
    });
  });
  describe("DELETE branch", () => {
    it("should delete a branch", async () => {
      const { app } = await makeSut();
      const branch = await app.branch.createBranch({
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.email(),
        logo_url: faker.image.imageUrl(),
        attributes: {
          test: "test",
        },
      });
      const deletedBranch = await app.branch.deleteBranch({
        branch_id: branch.branch_id,
      });
      expect(deletedBranch).toHaveProperty("branch_id");
      expect(deletedBranch).toHaveProperty("deleted_at");
      expect(deletedBranch.deleted_at).not.toBeNull();
    });
    it("should return an error if the user is not allowed to perform this action", async () => {
      const app = makeApp({
        branch_id: 1,
        staff: {
          active: true,
          id: 1,
          branch_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const promisses = app.branch.deleteBranch({
        branch_id: 1,
      });
      await expect(promisses).rejects.toThrowError(
        "You are not allowed to perform this action"
      );
    });
  });
  describe("Update Branch", () => {
    it("should update a branch", async () => {
      const { app } = await makeSut();
      const branchData = {
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.domainName(),
      };
      const updatedBranchRequest = {
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.domainName(),
      };
      const branch = await app.branch.createBranch(branchData);

      const updatedBranch = await app.branch.updateBranch({
        branch_id: branch.branch_id,
        ...updatedBranchRequest,
      });
      expect(updatedBranch).toMatchObject(updatedBranchRequest);
    });
    it("should return an error if the user is not allowed to perform this action", async () => {
      const app = makeApp({
        branch_id: 1,
        staff: {
          active: true,
          id: 1,
          branch_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          last_name: faker.name.lastName(),
          role: "EMPLOYEE",
        },
      });
      const promisses = app.branch.updateBranch({
        branch_id: 1,
        name: faker.company.name(),
        company_code: faker.random.alphaNumeric(10),
        website: faker.internet.domainWord(),
      });
      await expect(promisses).rejects.toThrowError(
        "You are not allowed to perform this action"
      );
    });
  });
});
