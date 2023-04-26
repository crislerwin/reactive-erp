import { describe, test, expect, beforeEach } from "vitest";
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
        emailAddress: "test",
      },
    },
  });
  return appRouter.createCaller(ctx);
};

describe("Staff", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  test("Should start empty", async () => {
    const caller = makeCaller();
    const result = await caller.users.getAll();
    expect(result).toHaveLength(0);
  });
  test("Should create a new user", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "test",
      enterpriseId: "test",
      userName: "test",
      type: "visitor",
      userId: "22",
    });
    const result = await caller.users.getAll();
    expect(result).toHaveLength(1);
  });
  test("Should get a user", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "test",
      enterpriseId: "test",
      userName: "test",
      type: "visitor",
      userId: "22",
    });
    const result = await caller.users.getLoggedUser();
    expect(result).toHaveProperty("userName", "test");
  });
  test("Should update a user", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "test",
      enterpriseId: "test",
      userName: "test",
      type: "visitor",
      userId: "22",
    });
    await caller.users.updateUser({
      email: "test2",
      userName: "test2",
      userId: "22",
    });
    const result = await caller.users.getLoggedUser();
    expect(result).toHaveProperty("userName", "test2");
  });
  test("Should delete a user", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "test",
      enterpriseId: "test",
      userName: "test",
      type: "visitor",
      userId: "22",
    });
    await caller.users.deleteUser({
      userId: "22",
    });
    const result = await caller.users.getAll();
    expect(result).toHaveLength(0);
  });
  test("Should get all by enterpriseId", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "any_email@mail.com",
      enterpriseId: "1",
      userName: "any_user",
      type: "admin",
      userId: "1",
    });
    const result = await caller.users.getAllByEnterpriseId({
      enterpriseId: "1",
      isAllowedToSeeAll: true,
    });
    expect(result).toHaveLength(1);
  });
  test("Should throw error if user is not allowed to see all", async () => {
    const caller = makeCaller();
    await caller.users.createUser({
      email: "any_email@email.com",
      enterpriseId: "1",
      userName: "any_user",
      type: "admin",
      userId: "1",
    });
    await caller.users.addUserPermission({
      userId: "1",
      name: "seeAllUsers",
      value: "false",
    });
    const result = caller.users.getLoggedUser();
    await expect(result).rejects.toThrowError();
  });
});
