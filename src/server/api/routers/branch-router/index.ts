import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createBranchSchema, updateBranchSchema } from "@/common/schemas";
import { CustomError } from "@/common/errors/customErrors";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];

const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError(CustomError.NOT_ALLOWED);
};

export const branchRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    validateRole(ctx.session.account.role);
    return ctx.prisma.branch.findMany();
  }),
  createBranch: protectedProcedure
    .input(createBranchSchema)
    .mutation(async ({ ctx, input }) => {
      validateRole(ctx.session.account.role);
      return ctx.prisma.branch.create({
        data: {
          name: input.name,
          attributes: input.attributes,
        },
      });
    }),
  deleteBranch: protectedProcedure
    .input(z.object({ branch_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      validateRole(ctx.session.account.role);
      const usersInBranch = await ctx.prisma.staff.findMany({
        where: { branch_id: input.branch_id },
      });
      if (usersInBranch.length > 0)
        throw new TRPCError(CustomError.BRANCH_NOT_EMPTY);

      return ctx.prisma.branch.update({
        where: { branch_id: input.branch_id },
        data: { deleted_at: new Date() },
      });
    }),
  updateBranch: protectedProcedure
    .input(updateBranchSchema)
    .mutation(async ({ ctx, input }) => {
      validateRole(ctx.session.account.role);
      return ctx.prisma.branch.update({
        where: { branch_id: input.branch_id },
        data: {
          name: input.name,
          attributes: input.attributes,
        },
      });
    }),
});
