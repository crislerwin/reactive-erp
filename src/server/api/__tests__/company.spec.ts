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
    const { id: companyId } = await caller.companies.createCompany(
      companyRequest
    );
    const result = await caller.companies.getCompanyById({
      companyId: companyId,
    });
    expect(result).toHaveProperty("socialReason", "any_company_name");
  });
  test("Should list all companies", async () => {
    const caller = makeCaller();
    const companyRequest = makeCompanyRequest();
    await caller.companies.createCompany(companyRequest);
    const result = await caller.companies.listCompanies();
    expect(result).toHaveLength(1);
  });
});
