import { describe, test, expect } from "vitest";
import { app } from "./helpers";
import { faker } from "@faker-js/faker";

describe("Institutions Test", () => {
  test("Should throw if try to create with invalid permission", async () => {
    const sut = app(JSON.stringify([{ name: "invalid", value: true }]));
    const institutionPromise = sut.institution.upsert({
      company_code: faker.datatype.number().toString(),
      email: faker.internet.email(),
      name: faker.company.name(),
      static_logo_url: faker.image.imageUrl(),
    });
    await expect(institutionPromise).rejects.toThrowError();
  });
});
