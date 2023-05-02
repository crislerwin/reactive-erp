import { prisma } from "@/server/db";
import { test, beforeEach, expect, describe, vi } from "vitest";
import { makeCaller } from "./utils";

describe("Company", () => {
  beforeEach(async () => {
    await prisma.company.deleteMany();
  });

  const makeCompanyRequest = () => ({
    socialReason: "any_company_name",
    cnpj: "any_cnpj",
    fantasyName: "any_fantasy_name",
    email: "any_email",
  });

  test("Should create a new company", async () => {
    const caller = makeCaller();
    const companyRequest = makeCompanyRequest();
    const { id: companyId } = await caller.company.save(companyRequest);
    const result = await caller.company.findById({
      companyId: companyId,
    });
    expect(result).toHaveProperty("socialReason", "any_company_name");
  });
  test("Should list all companies", async () => {
    const caller = makeCaller();
    const companyRequest = makeCompanyRequest();
    await caller.company.save(companyRequest);
    const result = await caller.company.findAll();
    expect(result).toHaveLength(1);
  });
  test("Should Delete a company", async () => {
    const caller = makeCaller();
    const companyRequest = makeCompanyRequest();
    const { id: companyId } = await caller.company.save(companyRequest);
    await caller.company.delete({ companyId: companyId });
    const result = await caller.company.findAll();
    expect(result).toHaveLength(0);
  });
});
