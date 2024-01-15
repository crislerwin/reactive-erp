import { faker } from "@faker-js/faker";
import { appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";

export const app = (role = "admin") => {
  const makeSession = () => ({
    session: {
      user: {
        id: faker.datatype.number(),
        name: faker.name.firstName(),
        avatar_url: faker.internet.avatar(),
        email: faker.internet.email(),
        updatedAt: faker.date.recent(),
        createdAt: faker.date.recent(),
        role,
      },
    },
  });
  return appRouter.createCaller(createInnerTRPCContext(makeSession()));
};
