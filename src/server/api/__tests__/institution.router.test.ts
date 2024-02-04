import { describe, test, expect } from "vitest";
import { app } from "./helpers";
import { type z } from "zod";
import { type updateInstitutionSchema } from "../validators";
import { faker } from "@faker-js/faker";

type InstitutionParams = z.infer<typeof updateInstitutionSchema>;
const makeInstitutionParams = (): InstitutionParams => ({
  institution_id: faker.datatype.number(),
  company_code: faker.datatype.number().toString(),
  email: faker.internet.email(),
  name: faker.company.name(),
  static_logo_url: faker.image.imageUrl(),
});

describe("Institutions Test", () => {
  test("Should create an institution", async () => {
    const sut = app();
    const institutionParams = makeInstitutionParams();
    const institution = await sut.institution.upsert(institutionParams);
    expect(institution).toBeTruthy();
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
      institution_id: institution.institution_id,
    });
    expect(updatedInstitution).toBeTruthy();
    expect(updatedInstitution.name).toBe(newInstitutionParams.name);
  });
  test("Should delete instution", async () => {
    const sut = app();

    const institutionParams = makeInstitutionParams();
    const institution = await sut.institution.upsert(institutionParams);
    expect(institution).toBeTruthy();
    await sut.institution.delete({
      id: institution.institution_id,
    });
    const deletedInstitution = sut.institution.findById({
      id: institution.institution_id,
    });
    await expect(deletedInstitution).rejects.to.toThrowError(
      "Institution not found"
    );
  });
});
