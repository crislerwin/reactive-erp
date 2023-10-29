import { PrismaClient } from "@prisma/client";
import { describe, expect, test } from "vitest";

describe("Company Routes", () => {
  const prismaClient = new PrismaClient();

  describe("Get by Id", () => {
    test("Should get users", () => {
      expect(1).toEqual(1);
    });
  });
});
