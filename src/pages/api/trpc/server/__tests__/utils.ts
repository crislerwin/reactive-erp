import { prisma } from "../infra/db/prisma/prisma";
import { appRouter } from "../main/root";
import { createInnerTRPCContext } from "../main/trpc";

export const makeCaller = () => {
  const ctx = createInnerTRPCContext({
    prisma: prisma,
    session: {
      user: {
        id: "22",
        createdAt: 1,
        updatedAt: 1,
        userName: "test",
        emailAddress: "crislerwintler@gmail.com",
        isSuperAdmin: true,
      },
    },
  });
  return appRouter.createCaller(ctx);
};
