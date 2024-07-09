import { afterAll, afterEach, describe, expect, test } from "vitest";
import { makeFakeAccount, makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { type UpdateStaffMemberInput } from "../routers/staff/schemas";
import { type Staff } from "@prisma/client";

describe("Staff member Router", () => {
  afterEach(async () => {
    await prisma.staff.deleteMany();
    await prisma.branch.deleteMany();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

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
    test("Should throw if branch not found", async () => {
      const sut = makeSut();
      const branch_id = faker.datatype.number();
      const promise = sut.staff.findAll({ branch_id });
      await expect(promise).rejects.toThrowError("Branch not found");
    });

    test("Should return staff list on the same branch", async () => {
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
    test("Should return staff list on different branch", async () => {
      const sut = makeSut();
      const branch1 = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      const branch2 = await prisma.branch.create({
        data: {
          name: faker.company.name(),
          company_code: faker.helpers.fake("###-###-###"),
          email: faker.internet.email(),
        },
      });
      await prisma.staff.createMany({
        data: [
          {
            branch_id: branch1.branch_id,
            email: faker.internet.email(),
            first_name: faker.name.firstName(),
            role: "ADMIN",
          },
          {
            branch_id: branch2.branch_id,
            email: faker.internet.email(),
            first_name: faker.name.firstName(),
            role: "ADMIN",
          },
        ],
      });
      const result = await sut.staff.findAll({ branch_id: branch1.branch_id });
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);

      const result2 = await sut.staff.findAll({ branch_id: branch2.branch_id });
      expect(result2).toBeDefined();
      expect(result2).toBeInstanceOf(Array);
      expect(result2.length).toBe(1);
      const ownerAccount: Staff = { ...makeFakeAccount(), role: "OWNER" };
      const sutOwner = makeSut(ownerAccount);
      const result3 = await sutOwner.staff.findAll({
        branch_id: branch2.branch_id,
      });
      expect(result3).toBeDefined();
      expect(result3).toBeInstanceOf(Array);
      expect(result3.length).toBe(2);
    });
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
          role: "MANAGER",
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
    test("Should throw if staff member not found", async () => {
      const sut = makeSut();
      const id = faker.datatype.number();
      const promise = sut.staff.softDeletedStaffMember({ id });
      await expect(promise).rejects.toThrowError("Staff member not found");
    });
    test("Should throw if staff member already deleted", async () => {
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
          deleted_at: new Date(),
          active: false,
        },
      });
      const promise = sut.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError("Staff member not found");
    });
    test("Should throw if staff member is owner", async () => {
      const ownerAccount: Staff = { ...makeFakeAccount(), role: "OWNER" };
      const sut = makeSut(ownerAccount);
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
          role: "OWNER",
        },
      });
      const promise = sut.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError("You cannot delete an owner");
    });
    test("Should throw if staff member is admin and not owner", async () => {
      const ownerAccount: Staff = { ...makeFakeAccount(), role: "ADMIN" };
      const sut = makeSut(ownerAccount);
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
      const promise = sut.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError(
        "You are not allowed to perform this action"
      );
    });
  });
});
