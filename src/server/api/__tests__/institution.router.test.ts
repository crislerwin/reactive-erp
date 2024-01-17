import { describe, test, expect } from "vitest";
import { app } from "./helpers";
import { type z } from "zod";
import { type updateInstitutionSchema } from "../schemas";
import { faker } from "@faker-js/faker";

type InstitutionParams = z.infer<typeof updateInstitutionSchema>;
const makeInstitutionParams = (): InstitutionParams => ({
  company_code: faker.datatype.number().toString(),
  email: faker.internet.email(),
  name: faker.company.name(),
  static_logo_url: faker.image.imageUrl(),
});

describe("Institutions Test", () => {
  test("Should throw if try to create with invalid permission", async () => {
    const sut = app(JSON.stringify([{ name: "invalid", value: true }]));
    const institutionPromise = sut.institution.upsert(makeInstitutionParams());
    await expect(institutionPromise).rejects.toThrowError();
  });

  test("Should create an institution", async () => {
    const sut = app();
    const institutionParams = makeInstitutionParams();
    const institution = await sut.institution.upsert(institutionParams);
    expect(institution).toBeTruthy();
    expect(institution.company_code).toBe(institutionParams.company_code);
  });
  test("Should update an institution", async () => {
    const sut = app();
    const institutionParams = makeInstitutionParams();
    const institution = await sut.institution.upsert(institutionParams);
    const newInstitutionParams: InstitutionParams = {
      ...makeInstitutionParams(),
      name: "new name",
    };
    expect(institution).toBeTruthy();
    expect(institution.name).toBe(institutionParams.name);
    const updatedInstitution = await sut.institution.upsert({
      ...newInstitutionParams,
      id: institution.id,
    });
    expect(updatedInstitution).toBeTruthy();
    expect(updatedInstitution.name).toBe(newInstitutionParams.name);
  });
});
