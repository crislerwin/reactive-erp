import { describe, test, expect, beforeEach, vi } from "vitest";
import { createInnerTRPCContext } from "../trpc";
import { appRouter } from "../root";
import { faker } from "@faker-js/faker";

const makeFakeProviderParams = () => ({
  email: faker.internet.email(),
  name: faker.name.fullName(),
  first_name: faker.name.firstName(),
  last_name: faker.name.lastName(),
  middle_name: faker.name.middleName(),
  bio: {
    date_of_birth: faker.date.birthdate().toISOString(),
    phone_number: faker.phone.number(),
  },
});

const makeSession = () => ({
  session: {
    user: {
      id: faker.datatype.number(),
      name: faker.name.firstName(),
      avatar_url: faker.internet.avatar(),
      email: faker.internet.email(),
      updatedAt: faker.date.recent(),
      createdAt: faker.date.recent(),
      role: "admin",
    },
  },
});
const makeSut = () => {
  const ctx = createInnerTRPCContext(makeSession());
  const sut = appRouter.createCaller(ctx);
  return {
    sut,
    ctx,
  };
};

describe("Provider router", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("Should create a provider", async () => {
    const { sut } = makeSut();
    const createdProvider = await sut.provider.createOne(
      makeFakeProviderParams()
    );
    expect(createdProvider).toBeDefined();
  });
  test("Should update a provider name", async () => {
    const { sut } = makeSut();
    const newName = faker.name.firstName();
    const createdProvider = await sut.provider.createOne(
      makeFakeProviderParams()
    );
    const updatedProvider = await sut.provider.updateOne({
      ...makeFakeProviderParams(),
      id: createdProvider.id,
      name: newName,
    });
    expect(updatedProvider.name).toBe(newName);
  });

  test("Should add institution ids", async () => {
    const { sut } = makeSut();

    const newInstitution = await sut.institution.createOne({
      company_code: faker.datatype.number().toString(),
      email: faker.internet.email(),
      name: faker.company.name(),
      static_logo_url: faker.image.imageUrl(),
    });

    const createdProvider = await sut.provider.createOne({
      ...makeFakeProviderParams(),
      institution_ids: [newInstitution.id],
    });
    expect(createdProvider.institution_ids).toContain(newInstitution.id);
  });

  test("Should throw if add invalid institution id", async () => {
    const { sut } = makeSut();
    const invalidId = faker.datatype.number();
    const createdProviderPromises = sut.provider.createOne({
      ...makeFakeProviderParams(),
      institution_ids: [invalidId],
    });
    await expect(createdProviderPromises).rejects.toThrowError(
      "Invalid institution ids"
    );
  });

  test("Should find createdProvider", async () => {
    const { sut } = makeSut();
    const newProvider = await sut.provider.createOne(makeFakeProviderParams());
    const foundProvider = await sut.provider.findById({ id: newProvider.id });
    expect(foundProvider).toBeDefined();
    expect(foundProvider?.id).toBe(newProvider.id);
    expect(foundProvider?.name).toBe(newProvider.name);
  });
  test("Should throw if find soft deleted provider", async () => {
    const { sut } = makeSut();
    const newProvider = await sut.provider.createOne(makeFakeProviderParams());
    await sut.provider.softDelete({ id: newProvider.id });
    const deletedProviderPromises = sut.provider.findById({
      id: newProvider.id,
    });
    await expect(deletedProviderPromises).rejects.toThrowError(
      "Provider not found"
    );
  });
});
