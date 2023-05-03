import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "vitest";
import { prisma } from "@/server/db";
import { makeCaller } from "./utils";

describe("Staff", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.person.deleteMany();
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await prisma.person.deleteMany();
  });
  test("Should create a new user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    const result = await caller.person.getById({
      personId: personId,
    });
    expect(result).toHaveProperty("userName", "test");
  });

  test("Should get a logged person on success", async () => {
    const caller = makeCaller();
    await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });
    const result = await caller.person.getByEmail();
    expect(result).toHaveProperty("userName", "Crisler Wintler");
  });

  test("Should update a user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    await caller.person.update({
      personId: personId,
      companyId: 1,
      email: "crislerwintler@gmail.com",
      userName: "test2",
    });
    const result = await caller.person.getByEmail();
    expect(result).toHaveProperty("userName", "test2");
  });
  test("Should delete a user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    await caller.person.delete({
      personId: personId,
    });
    const result = await caller.person.findAll();
    expect(result).toHaveLength(0);
  });
  test("Should get all by enterpriseId", async () => {
    const caller = makeCaller();
    await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });
    const result = await caller.person.getByCompanyId({
      companyId: 1,
    });
    expect(result).toHaveLength(1);
  });
  test("Should add a user permission", async () => {
    const caller = makeCaller();
    const { personId } = await caller.person.save({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });

    await caller.person.addPermission({
      personId: personId,
      name: "any_name",
      value: "any_value",
    });
    const result = await caller.person.getById({
      personId: personId,
    });

    expect(result?.permissions).toHaveLength(1);
  });
});
