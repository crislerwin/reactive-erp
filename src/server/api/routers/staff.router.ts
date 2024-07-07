import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const staffRouter = createTRPCRouter({
  findAll: protectedProcedure
    .input(z.object({ branch_id: z.number() }))
    .query(async ({ ctx, input }) => {
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: input.branch_id },
      });
      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });

      return ctx.prisma.staff.findMany({ where: input });
    }),
  createStaffMember: protectedProcedure
    .input(
      z.object({
        branch_id: z.number(),
        first_name: z.string(),
        last_name: z.string().optional(),
        email: z.string().email(),
        password: z.string(),
        role: z.enum(["ADMIN", "EMPLOYEE", "MANAGER", "OWNER"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: input.branch_id },
      });

      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });
      const existingAccount = await ctx.prisma.account.findUnique({
        where: { email: input.email },
      });
      if (existingAccount)
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "Account already exists",
        });

      const newAccount = await ctx.prisma.account.create({
        data: {
          email: input.email,
          name: input.first_name,
          last_name: input.last_name,
          password: input.password,
        },
      });
      return ctx.prisma.staff.create({
        data: {
          account_id: newAccount.account_id,
          branch_id: input.branch_id,
          role: input.role,
          first_name: input.first_name,
        },
      });
    }),
});
