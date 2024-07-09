import { prisma } from "@/server/db";
import { appRouter } from "../../root";
import { createCaller } from "../../trpc";
import { faker } from "@faker-js/faker";
import { type Staff } from "@prisma/client";

export const makeFakeAccount = (): Staff => ({
  active: true,
  id: faker.datatype.number(),
  branch_id: faker.datatype.number(),
  role: "ADMIN",
  email: faker.internet.email(),
  last_name: faker.name.lastName(),
  first_name: faker.name.firstName(),
  created_at: faker.date.past(),
  deleted_at: null,
  updated_at: faker.date.recent(),
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
