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
});
