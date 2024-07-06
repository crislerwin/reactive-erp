import { prisma } from "@/server/db";
import { appRouter } from "../../root";
import { createCaller } from "../../trpc";
import { faker } from "@faker-js/faker";
import { type Account } from "@prisma/client";

export const makeFakeAccount = (): Account => ({
  account_id: faker.datatype.number(),
  email: faker.internet.email(),
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
  last_name: faker.name.lastName(),
  name: faker.name.firstName(),
  password: faker.internet.password(),
});

export const makeBranchRequest = () => ({
  name: faker.company.name(),
  company_code: faker.helpers.fake("###-###-###"),
  email: faker.internet.email(),
});

export const makeSut = (account = makeFakeAccount()) => {
  const app = createCaller(appRouter);
  return app({
    prisma,
    session: {
      account,
    },
  });
};
