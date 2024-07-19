import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CustomError } from "@/common/errors/customErrors";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];

const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError(CustomError.NOT_ALLOWED);
};

export const customerRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    validateRole(ctx.session.account.role);
    const { account } = ctx.session;
    const branch = await ctx.prisma.branch.findUnique({
      where: {
        branch_id: account.branch_id,
      },
      include: { staff_members: true },
    });
    if (!branch) throw new TRPCError(CustomError.BRANCH_NOT_FOUND);
    return ctx.prisma.customer.findMany({
      where: { branch_id: account.branch_id },
    });
  }),
});
