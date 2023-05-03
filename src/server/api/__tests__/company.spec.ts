import { prisma } from "@/server/db";
import {
  test,
  beforeEach,
  expect,
  describe,
  beforeAll,
  afterAll,
} from "vitest";
import { makeCaller } from "./utils";

describe("Company", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });
  afterAll(async () => {
    await prisma.company.deleteMany();
    await prisma.$disconnect();
  });
  beforeEach(async () => {
    await prisma.company.deleteMany();
  });

  const makeCompanyRequest = () => ({
    socialReason: "any_company_name",
    cnpj: "43745206000153",
    fantasyName: "any_fantasy_name",
    email: "any_email@mail.com",
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
  test("Should Update a company", async () => {
    const caller = makeCaller();
    const companyRequest = makeCompanyRequest();
    const { id: companyId } = await caller.company.save(companyRequest);
    const result = await caller.company.update({
      companyId: companyId,
      socialReason: "new_company_name",
    });
    expect(result).toHaveProperty("socialReason", "new_company_name");
  });
});
