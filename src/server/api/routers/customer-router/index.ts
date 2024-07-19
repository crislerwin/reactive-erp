import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ServerError } from "@/common/errors/customErrors";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];

const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError(ServerError.NOT_ALLOWED);
};

export const customerRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.staffMember) throw new TRPCError(ServerError.NOT_ALLOWED);
    validateRole(ctx.session.staffMember.role);
    const { staffMember } = ctx.session;
    const branch = await ctx.prisma.branch.findUnique({
      where: {
        branch_id: staffMember.branch_id,
      },
      include: { staff_members: true },
    });
    if (!branch) throw new TRPCError(ServerError.BRANCH_NOT_FOUND);
    return ctx.prisma.customer.findMany({
      where: { branch_id: staffMember.branch_id },
    });
  }),
});
