import { describe, expect, test } from "vitest";
import { makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { type UpdateStaffMemberInput } from "../routers/staff/schemas";

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
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
        {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
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

      const email = faker.internet.email();
      await sut.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email,
        password: faker.internet.password(),
        role: "ADMIN",
      });
      const promise = sut.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email,
        password: faker.internet.password(),
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError("Account already exists");
    });

    test("Should create staff member correcly", async () => {
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
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("first_name");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
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
          email: faker.internet.email(),
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
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
      expect(result.first_name).toBe(memberToUpdate.first_name);
      expect(result.role).toBe(memberToUpdate.role);
    });
  });
  describe("Get staff member", () => {
    test("Should return staff member", async () => {
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
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });
      const result = await sut.staff.getStaffMember({ id: staff.id });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
    });
    test("Should return null if staff member not found", async () => {
      const sut = makeSut();
      const id = faker.datatype.number();
      const result = await sut.staff.getStaffMember({ id });
      expect(result).toBeNull();
    });
  });
  describe("DELETE staff member", () => {
    test("Should soft delete staff member", async () => {
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
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });
      const allStaff = await sut.staff.findAll({
        branch_id: branch.branch_id,
      });
      expect(allStaff).toBeDefined();
      expect(allStaff).toBeInstanceOf(Array);
      expect(allStaff.length).toBe(1);

      const createdStaff = await sut.staff.getStaffMember({ id: staff.id });
      expect(createdStaff).toBeDefined();
      expect(createdStaff).toHaveProperty("id");
      expect(createdStaff).toHaveProperty("email");
      expect(createdStaff).toHaveProperty("branch_id");
      expect(createdStaff).toHaveProperty("role");
      expect(createdStaff).toHaveProperty("first_name");
      expect(createdStaff?.deleted_at).toBeNull();
      const result = await sut.staff.softDeletedStaffMember({ id: staff.id });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
      expect(result.deleted_at).toBeDefined();

      const staffDeleted = await prisma.staff.findUnique({
        where: { id: staff.id },
      });
      expect(staffDeleted).toBeDefined();
      expect(staffDeleted?.deleted_at).toBeDefined();
      expect(staffDeleted?.active).toBe(false);

      const staffQuery = await sut.staff.getStaffMember({ id: staff.id });
      expect(staffQuery).toBeNull();
      const allDeletedStaff = await sut.staff.findAll({
        branch_id: branch.branch_id,
      });
      expect(allDeletedStaff).toBeDefined();
      expect(allDeletedStaff).toBeInstanceOf(Array);
      expect(allDeletedStaff.length).toBe(0);
    });
  });
});
