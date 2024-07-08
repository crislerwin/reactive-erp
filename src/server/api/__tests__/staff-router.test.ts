import { describe, expect, test } from "vitest";
import { makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { UpdateStaffMemberInput } from "../routers/staff/schemas";

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

  test("Should return staff list", async () => {
    const sut = makeSut();
    const branch = await prisma.branch.create({
      data: {
        name: faker.company.name(),
        company_code: faker.helpers.fake("###-###-###"),
        email: faker.internet.email(),
      },
    });
    await prisma.staff.createMany({
      data: [
        {
          branch_id: branch.branch_id,
          account_id: faker.datatype.number(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
        {
          branch_id: branch.branch_id,
          account_id: faker.datatype.number(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      ],
    });
    const result = await sut.staff.findAll({ branch_id: branch.branch_id });
    expect(result).toBeDefined();
    expect(result).toBeInstanceOf(Array);
    expect(result.length).toBe(2);
  });

  describe("Create Staff Member", () => {
    test("Should throw if branch not found", async () => {
      const sut = makeSut();
      const branch_id = faker.datatype.number();
      const promise = sut.staff.createStaffMember({
        branch_id,
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError("Branch not found");
    });

    test("Should throw if account already exists", async () => {
      const sut = makeSut();
      const branch = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      const account = await prisma.account.create({
        data: {
          email: faker.internet.email(),
          name: faker.name.firstName(),
          password: faker.internet.password(),
        },
      });
      const promise = sut.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email: account.email,
        password: faker.internet.password(),
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError("Account already exists");
    });

    test("Should create staff member", async () => {
      const sut = makeSut();
      const branch = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      const result = await sut.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: "ADMIN",
      });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("account_id");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
    });
  });
  describe("Update staff member", () => {
    test("Should update staff member", async () => {
      const sut = makeSut();
      const branch = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          account_id: faker.datatype.number(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });

      const memberToUpdate: UpdateStaffMemberInput = {
        branch_id: branch.branch_id,
        staff_id: staff.id,
        first_name: faker.name.firstName(),
        role: "MANAGER",
      };
      const result = await sut.staff.updateStaffMember(memberToUpdate);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("account_id");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
      expect(result.first_name).toBe(memberToUpdate.first_name);
      expect(result.role).toBe(memberToUpdate.role);
    });
  });
});
