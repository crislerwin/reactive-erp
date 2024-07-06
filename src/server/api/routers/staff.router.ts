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
});
