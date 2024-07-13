import { describe, expect, test } from "vitest";
import { makeStaffRequest, makeApp, makeSut } from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { type UpdateStaffMemberInput } from "../../../common/schemas/staff.schema";
import { type Staff } from "@prisma/client";
import { ErrorType } from "@/common/errors/common";

describe("Staff member Router", () => {
  describe("List All", () => {
    test("should return empty if not exist staff", async () => {
      const { app } = await makeSut();

      const result = await app.staff.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });
    test("Should throw if branch not found", async () => {
      const branch_id = faker.datatype.number();
      const app = makeApp({ branch_id });
      const promise = app.staff.findAll();
      await expect(promise).rejects.toThrowError(ErrorType.BRANCH_NOT_FOUND);
    });

    test("Should return staff list on the same branch", async () => {
      const { app, branch } = await makeSut();
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
      const result = await app.staff.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);
    });
    test("Should return staff list on different branch", async () => {
      const { app, branch: branch1 } = await makeSut();

      const branch2 = await prisma.branch.create({
        data: {
          name: faker.company.name(),
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
      const result = await app.staff.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);

      const result2 = await app.staff.findAll();
      expect(result2).toBeDefined();
      expect(result2).toBeInstanceOf(Array);
      expect(result2.length).toBe(1);
      const accountOwner: Staff = {
        ...makeStaffRequest(branch1.branch_id),
        role: "OWNER",
      };
      const sutOwner = makeApp({
        branch_id: branch1.branch_id,
        staff: accountOwner,
      });
      const result3 = await sutOwner.staff.findAll();
      expect(result3).toBeDefined();
      expect(result3).toBeInstanceOf(Array);
      expect(result3.length).toBeGreaterThan(1);
    });
  });

  describe("Create Staff Member", () => {
    test("Should throw if branch not found", async () => {
      const branch_id = faker.datatype.number();
      const sut = makeApp({ branch_id });
      const promise = sut.staff.createStaffMember({
        branch_id,
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError(ErrorType.BRANCH_NOT_FOUND);
    });

    test("Should throw if account already exists", async () => {
      const { app, branch } = await makeSut();
      const email = faker.internet.email();
      await app.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email,
        role: "ADMIN",
      });
      const promise = app.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email,
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError(
        ErrorType.ACCOUNT_ALREADY_EXISTS
      );
    });

    test("Should create staff member correcly", async () => {
      const { app, branch } = await makeSut();
      const result = await app.staff.createStaffMember({
        branch_id: branch.branch_id,
        first_name: faker.name.firstName(),
        email: faker.internet.email(),

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
      const { app, branch } = await makeSut();

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
        id: staff.id,
        active: true,
        first_name: faker.name.firstName(),
        role: "MANAGER",
      };
      const result = await app.staff.updateStaffMember(memberToUpdate);
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
      const { app, branch } = await makeSut();
      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });
      const result = await app.staff.getStaffMember({ id: staff.id });
      expect(result).toBeDefined();
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email");
      expect(result).toHaveProperty("branch_id");
      expect(result).toHaveProperty("role");
      expect(result).toHaveProperty("first_name");
    });
    test("Should throw if staff member is not found", async () => {
      const { app } = await makeSut();
      const id = faker.datatype.number();
      const promise = app.staff.getStaffMember({ id });
      await expect(promise).rejects.toThrowError(ErrorType.USER_NOT_FOUND);
    });
  });
  describe("DELETE staff member", () => {
    test("Should soft delete staff member", async () => {
      const { app, branch } = await makeSut();

      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "MANAGER",
        },
      });
      const allStaff = await app.staff.findAll();
      expect(allStaff).toBeDefined();
      expect(allStaff).toBeInstanceOf(Array);
      expect(allStaff.length).toBe(1);

      const createdStaff = await app.staff.getStaffMember({ id: staff.id });
      expect(createdStaff).toBeDefined();
      expect(createdStaff).toHaveProperty("id");
      expect(createdStaff).toHaveProperty("email");
      expect(createdStaff).toHaveProperty("branch_id");
      expect(createdStaff).toHaveProperty("role");
      expect(createdStaff).toHaveProperty("first_name");
      expect(createdStaff?.deleted_at).toBeNull();

      const result = await app.staff.softDeletedStaffMember({ id: staff.id });

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

      const staffMemberPromise = app.staff.getStaffMember({ id: staff.id });
      await expect(staffMemberPromise).rejects.toThrowError(
        ErrorType.USER_NOT_FOUND
      );
    });
    test("Should throw if staff member not found", async () => {
      const { app } = await makeSut();
      const id = faker.datatype.number();
      const promise = app.staff.softDeletedStaffMember({ id });
      await expect(promise).rejects.toThrowError(ErrorType.USER_NOT_FOUND);
    });
    test("Should throw if staff member already deleted", async () => {
      const { app, branch } = await makeSut();

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
      const promise = app.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError(ErrorType.USER_NOT_FOUND);
    });
    test("Should throw if staff member is owner", async () => {
      const { branch } = await makeSut();
      const staffOwner: Staff = {
        ...makeStaffRequest(branch.branch_id),
        role: "OWNER",
      };
      const app = makeApp({ staff: staffOwner, branch_id: branch.branch_id });

      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "OWNER",
        },
      });
      const promise = app.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError(ErrorType.NOT_ALLOWED);
    });
    test("Should throw if staff member is admin and not owner", async () => {
      const { branch } = await makeSut();
      const staffAdmin: Staff = {
        ...makeStaffRequest(branch.branch_id),
        role: "ADMIN",
      };
      const app = makeApp({ staff: staffAdmin, branch_id: branch.branch_id });

      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });
      const promise = app.staff.softDeletedStaffMember({ id: staff.id });
      await expect(promise).rejects.toThrowError(ErrorType.NOT_ALLOWED);
    });
  });
});
