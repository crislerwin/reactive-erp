import { faker } from "@faker-js/faker";
import { appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";
import { PermissionTypes } from "../../auth/permissions";

export const backofficePermissions = JSON.stringify([
  {
    name: PermissionTypes.BACKOFFICE,
    value: true,
  },
]);

export const app = (permissions = backofficePermissions) => {
  return appRouter.createCaller(
    createInnerTRPCContext({
      session: {
        user: {
          id: faker.datatype.number(),
          name: faker.name.firstName(),
          avatar_url: faker.internet.avatar(),
          email: faker.internet.email(),
          updatedAt: faker.date.recent(),
          createdAt: faker.date.recent(),
          provider_id: null,
          permissions,
        },
      },
    })
  );
};
