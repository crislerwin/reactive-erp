import { describe, test, expect, beforeEach, vi } from "vitest";
import { createInnerTRPCContext } from "../trpc";
import { appRouter } from "../root";
import { prisma } from "@/server/db";
import { faker } from "@faker-js/faker";

const makeFakeProvider = () => ({
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

const makeSut = () => {
  const ctx = createInnerTRPCContext({
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
    prisma: prisma,
  });
  const sut = appRouter.createCaller({
    ...ctx,
    prisma: prisma,
  });
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
    const createdProvider = await sut.provider.createOne(makeFakeProvider());
    expect(createdProvider).toBeDefined();
  });
  test("Should update a provider name", async () => {
    const { sut } = makeSut();
    const newName = faker.name.firstName();
    const createdProvider = await sut.provider.createOne(makeFakeProvider());
    const updatedProvider = await sut.provider.update({
      ...makeFakeProvider(),
      id: createdProvider.id,
      name: newName,
    });
    expect(updatedProvider.name).toBe(newName);
  });
});
