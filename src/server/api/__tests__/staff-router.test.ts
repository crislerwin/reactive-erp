import { describe, expect, it } from "vitest";
import {
  makeStaffRequest,
  makeApp,
  makeSut,
  createStaffMember,
  createBranch,
} from "./__mocks__";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";
import { type UpdateStaffMemberInput } from "../../../common/schemas/staff.schema";
import { ErrorType } from "@/common/errors/customErrors";

describe("Staff member Router", () => {
  describe("List All", () => {
    it("should return only the logged staff member if is employee", async () => {
      const branch = await prisma.branch.create({
        data: {
          name: faker.company.name(),
        },
      });

      const staff = await createStaffMember(branch.branch_id, "EMPLOYEE");
      const app = await makeApp({ branch_id: branch.branch_id, staff });

      const result = await app.staff.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });
    it("Should throw if branch not found", async () => {
      const branch_id = faker.datatype.number();
      const app = await makeApp({ branch_id });
      const promise = app.staff.findAll();
      await expect(promise).rejects.toThrowError(ErrorType.BRANCH_NOT_FOUND);
    });

    it("Should return staff list on the same branch include the logged user", async () => {
      const branch = await createBranch();
      const staff = await createStaffMember(branch.branch_id, "ADMIN");
      const app = await makeApp({ branch_id: branch.branch_id, staff });
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
      expect(result.length).toBe(3);
    });
    it("Should return staff list on different branch", async () => {
      const branch1 = await createBranch();
      const branch2 = await createBranch();

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
      const adminStaff1 = await createStaffMember(branch1.branch_id, "ADMIN");
      const { staff: staffQuery1 } = await makeApp({
        branch_id: branch1.branch_id,
        staff: adminStaff1,
      });
      const result = await staffQuery1.findAll();
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(2);

      const adminStaff2 = await createStaffMember(branch2.branch_id, "ADMIN");
      const { staff: staffQuery2 } = await makeApp({
        branch_id: branch2.branch_id,
        staff: adminStaff2,
      });
      const result2 = await staffQuery2.findAll();
      expect(result2).toBeDefined();
      expect(result2).toBeInstanceOf(Array);
      expect(result2.length).toBe(2);
    });
  });

  describe("Create Staff Member", () => {
    it("Should throw if branch not found", async () => {
      const branch_id = faker.datatype.number();
      const sut = await makeApp({ branch_id });
      const promise = sut.staff.createStaffMember({
        branch_id,
        first_name: faker.name.firstName(),
        email: faker.internet.email(),
        role: "ADMIN",
      });
      await expect(promise).rejects.toThrowError(ErrorType.BRANCH_NOT_FOUND);
    });

    it("Should throw if account already exists", async () => {
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

    it("Should create staff member correcly", async () => {
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
    it("Should update staff member", async () => {
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
    it("Should throw if try to update an OWNER", async () => {
      const { app, branch } = await makeSut();
      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "OWNER",
        },
      });
      const memberToUpdate: UpdateStaffMemberInput = {
        branch_id: branch.branch_id,
        id: staff.id,
        active: true,
        first_name: faker.name.firstName(),
        role: "MANAGER",
      };
      const promise = app.staff.updateStaffMember(memberToUpdate);
      await expect(promise).rejects.toThrowError(ErrorType.NOT_ALLOWED);
    });
  });
  describe("Get staff member", () => {
    it("Should return staff member", async () => {
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
    it("Should throw if staff member is not found", async () => {
      const { app } = await makeSut();
      const id = faker.datatype.number();
      const promise = app.staff.getStaffMember({ id });
      await expect(promise).rejects.toThrowError(
        ErrorType.STAFF_MEMBER_NOT_FOUND
      );
    });
  });
  describe("DELETE staff member", () => {
    it("Should soft delete staff member", async () => {
      const branch = await createBranch();
      const [adminStaff, employeeStaff] = await Promise.all([
        createStaffMember(branch.branch_id, "ADMIN"),
        createStaffMember(branch.branch_id, "EMPLOYEE"),
      ]);
      const app = await makeApp({
        branch_id: branch.branch_id,
        staff: adminStaff,
      });
      const allStaff = await app.staff.findAll();
      expect(allStaff).toBeDefined();
      expect(allStaff).toBeInstanceOf(Array);
      expect(allStaff.length).toBe(2);

      expect(employeeStaff).toBeDefined();
      expect(employeeStaff).toHaveProperty("id");
      expect(employeeStaff).toHaveProperty("email");
      expect(employeeStaff).toHaveProperty("branch_id");
      expect(employeeStaff).toHaveProperty("role");
      expect(employeeStaff).toHaveProperty("first_name");
      expect(employeeStaff?.deleted_at).toBeNull();

      await app.staff.softDeleteStaff({ id: employeeStaff.id });

      const staffDeleted = await prisma.staff.findUnique({
        where: { id: employeeStaff.id },
      });
      expect(staffDeleted).toBeDefined();
      expect(staffDeleted?.deleted_at).toBeDefined();
      expect(staffDeleted?.active).toBe(false);

      const staffMemberPromise = app.staff.getStaffMember({
        id: employeeStaff.id,
      });
      await expect(staffMemberPromise).rejects.toThrowError(
        ErrorType.STAFF_MEMBER_NOT_FOUND
      );
    });
    it("Should throw if staff member not found", async () => {
      const { app } = await makeSut();
      const id = faker.datatype.number();
      const promise = app.staff.softDeleteStaff({ id });
      await expect(promise).rejects.toThrowError(
        ErrorType.STAFF_MEMBER_NOT_FOUND
      );
    });
    it("Should throw if staff member already deleted", async () => {
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
      const promise = app.staff.softDeleteStaff({ id: staff.id });
      await expect(promise).rejects.toThrowError(
        ErrorType.STAFF_MEMBER_NOT_FOUND
      );
    });
    it("Should throw if staff member is owner", async () => {
      const { branch } = await makeSut();
      const staffOwner = await prisma.staff.create({
        data: {
          ...makeStaffRequest(branch.branch_id),
          role: "OWNER",
        },
      });
      const app = await makeApp({
        staff: staffOwner,
        branch_id: branch.branch_id,
      });

      const anotherStaffOwner = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "OWNER",
        },
      });
      const promise = app.staff.softDeleteStaff({
        id: anotherStaffOwner.id,
      });
      await expect(promise).rejects.toThrowError(ErrorType.NOT_ALLOWED);
    });
    it("Should throw if staff member is admin and not owner", async () => {
      const { branch } = await makeSut();

      const staffAdmin = await prisma.staff.create({
        data: {
          ...makeStaffRequest(branch.branch_id),
          role: "ADMIN",
        },
      });
      const app = await makeApp({
        staff: staffAdmin,
        branch_id: branch.branch_id,
      });

      const staff = await prisma.staff.create({
        data: {
          branch_id: branch.branch_id,
          email: faker.internet.email(),
          first_name: faker.name.firstName(),
          role: "ADMIN",
        },
      });
      const promise = app.staff.softDeleteStaff({ id: staff.id });
      await expect(promise).rejects.toThrowError(ErrorType.NOT_ALLOWED);
    });
  });
});
