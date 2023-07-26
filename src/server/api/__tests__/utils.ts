import { prisma } from "@/server/db";
import { appRouter } from "../root";
import { createInnerTRPCContext } from "../trpc";

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
        isSuper: true,
      },
    },
  });
  return appRouter.createCaller(ctx);
};
