import { describe, expect, test } from "vitest";
import { makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";

describe("Staff Router", () => {
  describe("List All", () => {
    test("should return empty if not exist staff", async () => {
      const sut = makeSut();
      const branch = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      const result = await sut.staff.findAll({ branch_id: branch.branch_id });
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
  });
  test("Should throw if branch not found", async () => {
    const sut = makeSut();
    const branch_id = faker.datatype.number();
    const promise = sut.staff.findAll({ branch_id });
    await expect(promise).rejects.toThrowError("Branch not found");
  });
});
