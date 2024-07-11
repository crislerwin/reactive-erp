import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const createBranchSchema = z.object({
  name: z.string(),
  logo_url: z.string().optional(),
  email: z.string(),
  company_code: z.string(),
  attributes: z.record(z.string()).optional(),
});
const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError({
      code: "UNAUTHORIZED",
      cause: "You are not allowed to perform this action",
    });
};
const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];
export const branchRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/branch" })
    .query(async ({ ctx }) => {
      validateRole(ctx.session.account.role);
      return ctx.prisma.branch.findMany({
        where: { deleted_at: null },
      });
    }),
  createBranch: protectedProcedure
    .meta({ method: "POST", path: "/branch" })
    .input(createBranchSchema)
    .mutation(async ({ ctx, input }) => {
      validateRole(ctx.session.account.role);
      return ctx.prisma.branch.create({
        data: {
          name: input.name,
          logo_url: input.logo_url,
          company_code: input.company_code,
          email: input.email,
          attributes: input.attributes,
        },
      });
    }),
  deleteBranch: protectedProcedure
    .meta({ method: "DELETE", path: "/branch" })
    .input(z.object({ branch_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      validateRole(ctx.session.account.role);
      return ctx.prisma.branch.update({
        where: { branch_id: input.branch_id },
        data: { deleted_at: new Date() },
      });
    }),
});
