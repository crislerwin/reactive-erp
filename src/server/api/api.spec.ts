import { describe, test, expect } from "vitest";
import { appRouter } from "./root";
import { prisma } from "../db";

describe("api", () => {
  test("users", async () => {
    const caller = appRouter.createCaller({ prisma: prisma, session: null });
  });
});
