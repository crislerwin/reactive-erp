import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CustomError } from "@/common/errors/customErrors";

export const productCategory = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/product-category" })
    .query(async ({ ctx }) => {
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: ctx.session.account.branch_id },
      });
      if (!branch) throw new TRPCError(CustomError.BRANCH_NOT_FOUND);
      return ctx.prisma.productCategory.findMany({
        where: {
          branch_id: ctx.session.account.branch_id,
        },
      });
    }),
});
