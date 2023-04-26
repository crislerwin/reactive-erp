import { describe, test, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";
import { prisma } from "@/server/db";

const makeCaller = () => {
  const ctx = createInnerTRPCContext({
    prisma: prisma,
    session: {
      user: {
        id: "22",
        createdAt: 1,
        updatedAt: 1,
        userName: "test",
        emailAddress: "crislerwintler@gmail.com",
        isSuperAdmin: true,
      },
    },
  });
  return appRouter.createCaller(ctx);
};

describe("Staff", () => {
  beforeEach(async () => {
    await prisma.person.deleteMany();
  });
  test("Should create a new user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    const result = await caller.persons.getPersonById({
      personId: personId,
    });
    expect(result).toHaveProperty("userName", "test");
  });

  test("Should get a logged person on success", async () => {
    const caller = makeCaller();
    await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });
    const result = await caller.persons.getLoggedUser();
    expect(result).toHaveProperty("userName", "Crisler Wintler");
  });

  test("Should update a user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    await caller.persons.updateUser({
      personId: personId,
      companyId: 1,
      email: "crislerwintler@gmail.com",
      userName: "test2",
    });
    const result = await caller.persons.getLoggedUser();
    expect(result).toHaveProperty("userName", "test2");
  });
  test("Should delete a user", async () => {
    const caller = makeCaller();
    const { personId } = await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "test",
    });
    await caller.persons.deleteUser({
      personId: personId,
    });
    const result = await caller.persons.getAll();
    expect(result).toHaveLength(0);
  });
  test("Should get all by enterpriseId", async () => {
    const caller = makeCaller();
    await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });
    const result = await caller.persons.getAllByEnterpriseId({
      companyId: 1,
    });
    expect(result).toHaveLength(1);
  });
  test("Should add a user permission", async () => {
    const caller = makeCaller();
    const { personId } = await caller.persons.createUser({
      email: "crislerwintler@gmail.com",
      companyId: 1,
      userName: "Crisler Wintler",
    });

    await caller.persons.addUserPermission({
      personId: personId,
      name: "any_name",
      value: "any_value",
    });
    const result = await caller.persons.getPersonById({
      personId: personId,
    });

    expect(result?.permissions).toHaveLength(1);
  });
});
