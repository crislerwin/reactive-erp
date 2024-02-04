import { describe, test, expect } from "vitest";
import { faker } from "@faker-js/faker";
import { app } from "./helpers";
import { makeFakeProviderParams } from "./__mocks__";

describe("Provider router", () => {
  test("Should create a provider", async () => {
    const sut = app();
    const createdProvider = await sut.provider.upsert(makeFakeProviderParams());
    expect(createdProvider).toBeDefined();
  });
  test("Should update a provider name", async () => {
    const sut = app();
    const newName = faker.name.firstName();

    const upsertProvider = await sut.provider.upsert({
      ...makeFakeProviderParams(),
      first_name: newName,
    });

    const updatedProvider = await sut.provider.findById({
      id: upsertProvider.id,
    });
    expect(updatedProvider.first_name).toBe(newName);
  });

  test("Should add institution ids", async () => {
    const sut = app();

    const newInstitution = await sut.institution.upsert({
      institution_id: faker.datatype.number(),
      company_code: faker.datatype.number().toString(),
      email: faker.internet.email(),
      name: faker.company.name(),
      static_logo_url: faker.image.imageUrl(),
    });

    const createdProvider = await sut.provider.upsert({
      ...makeFakeProviderParams(),
      institution_ids: [newInstitution.institution_id],
    });
    expect(createdProvider.institution_ids).toContain(
      newInstitution.institution_id
    );
  });

  test("Should throw if add invalid institution id", async () => {
    const sut = app();
    const invalidId = faker.datatype.number();
    const createdProviderPromises = sut.provider.upsert({
      ...makeFakeProviderParams(),
      institution_ids: [invalidId],
    });
    await expect(createdProviderPromises).rejects.toThrowError(
      "Invalid institution ids"
    );
  });

  test("Should find createdProvider", async () => {
    const sut = app();
    const newProvider = await sut.provider.upsert(makeFakeProviderParams());
    const foundProvider = await sut.provider.findById({
      id: newProvider.id,
    });
    expect(foundProvider).toBeDefined();
    expect(foundProvider?.id).toBe(newProvider.id);
  });
  test("Should throw if find soft deleted provider", async () => {
    const sut = app();
    const newProvider = await sut.provider.upsert(makeFakeProviderParams());
    await sut.provider.softDelete({ id: newProvider.id });
    const deletedProviderPromises = sut.provider.findById({
      id: newProvider.id,
    });
    await expect(deletedProviderPromises).rejects.toThrowError(
      "Provider not found"
    );
  });
});
