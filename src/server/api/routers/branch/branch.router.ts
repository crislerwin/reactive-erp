import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];
export const branchRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/branch" })
    .query(async ({ ctx }) => {
      if (!allowedRoles.includes(ctx.session.account.role))
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: "You are not allowed to perform this action",
        });

      return ctx.prisma.branch.findMany();
    }),
});
