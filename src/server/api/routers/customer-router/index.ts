import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ServerError } from "@/common/errors/customErrors";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../../../common/schemas";
import { z } from "zod";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];

const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError(ServerError.NOT_ALLOWED);
};

export const customerRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/customers" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      const branch = await ctx.prisma.branch.findUniqueOrThrow({
        where: { branch_id: ctx.session.staffMember.branch_id },
      });

      const { role } = ctx.session.staffMember;
      if (allowedRoles.includes(role))
        return ctx.prisma.customer.findMany({
          where: { deleted_at: null },
        });

      return ctx.prisma.customer.findMany({
        where: { deleted_at: null, branch_id: branch.branch_id },
      });
    }),
  create: protectedProcedure
    .meta({ method: "POST", path: "/customer" })
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { staffMember } = ctx.session;
      if (!staffMember) throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(staffMember.role);
      return ctx.prisma.customer.create({
        data: { ...input, branch_id: staffMember.branch_id },
      });
    }),
  update: protectedProcedure
    .meta({ method: "PUT", path: "/customer" })
    .input(updateCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { staffMember } = ctx.session;
      if (!staffMember) throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(staffMember.role);
      return ctx.prisma.customer.update({
        where: { customer_id: input.customer_id },
        data: input,
      });
    }),
  delete: protectedProcedure
    .meta({
      method: "DELETE",
      path: "/customer/:customer_id",
    })
    .input(z.object({ customer_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { staffMember } = ctx.session;
      if (!staffMember) throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(staffMember.role);
      return ctx.prisma.customer.update({
        where: { customer_id: input.customer_id },
        data: { deleted_at: new Date() },
      });
    }),
});
