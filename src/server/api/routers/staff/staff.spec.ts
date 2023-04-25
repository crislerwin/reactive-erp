import { describe, test, expect, vi, afterEach } from "vitest";
import { AppRouter, appRouter } from "../../root";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { inferProcedureInput } from "@trpc/server";
import { PrismaClient } from "@prisma/client";

const prisma = mockDeep<PrismaClient>();

const makeCaller = () => {
  return appRouter.createCaller({
    prisma: prisma,
  });
};

describe("api", () => {
  test("Should list users", async () => {
    const caller = makeCaller();
    prisma.staff.findMany.mockResolvedValueOnce([
      {
        userId: "22",
        email: "test",
        enterpriseId: "test",
        name: "test",
        role: "test",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const result = await caller.staff.getAll();
    console.log(result);
  });
});
