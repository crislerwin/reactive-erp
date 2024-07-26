import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  createStaffMemberSchema,
  customNumberValidator,
  updateStaffMemberSchema,
} from "@/common/schemas";
import { z } from "zod";
import { ServerError } from "@/common/errors/customErrors";

const allowedRoles = ["ADMIN", "MANAGER"];

export const staffRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/staff" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (ctx.session.staffMember.role === "OWNER")
        return ctx.prisma.staff.findMany();

      if (!allowedRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError(ServerError.NOT_ALLOWED);
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: ctx.session.staffMember.branch_id },
      });
      if (!branch) throw new TRPCError(ServerError.BRANCH_NOT_FOUND);
      return ctx.prisma.staff.findMany({
        where: {
          branch_id: ctx.session.staffMember.branch_id,
          role: { in: allowedRoles },
        },
      });
    }),
  createStaffMember: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/staff" } })
    .input(createStaffMemberSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: input.branch_id },
      });

      if (!branch) throw new TRPCError(ServerError.BRANCH_NOT_FOUND);
      const staffMember = await ctx.prisma.staff.findUnique({
        where: { email: input.email },
      });
      if (staffMember) throw new TRPCError(ServerError.ACCOUNT_ALREADY_EXISTS);

      return ctx.prisma.staff.create({
        data: {
          email: input.email,
          branch_id: input.branch_id ?? ctx.session.staffMember?.branch_id,
          role: input.role,
          first_name: input.first_name,
          last_name: input.last_name,
          active: input.active,
        },
      });
    }),
  updateStaffMember: protectedProcedure
    .meta({ openapi: { method: "PUT", path: "/staff/:id" } })
    .input(updateStaffMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const staffToUpdate = await ctx.prisma.staff.findUnique({
        where: { id: input.id, email: input.email },
      });
      if (!staffToUpdate)
        throw new TRPCError(ServerError.STAFF_MEMBER_NOT_FOUND);
      return ctx.prisma.staff.update({
        where: {
          id: input.id,
        },
        data: {
          first_name: input.first_name,
          last_name: input.last_name,
          active: input.active,
          role: input.role,
          branch_id: input.branch_id,
        },
      });
    }),
  softDeletedStaffMember: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/staff/:id" } })
    .input(z.object({ id: customNumberValidator }))
    .mutation(async ({ ctx, input }) => {
      const staffToDelete = await ctx.prisma.staff.findUnique({
        where: { id: input.id },
      });
      if (!staffToDelete)
        throw new TRPCError(ServerError.STAFF_MEMBER_NOT_FOUND);
      if (staffToDelete.role === "OWNER")
        throw new TRPCError(ServerError.NOT_ALLOWED);

      if (
        staffToDelete.role === "ADMIN" &&
        ctx.session.staffMember?.role !== "OWNER"
      ) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      return ctx.prisma.staff.update({
        where: { id: input.id },
        data: { deleted_at: new Date(), active: false },
      });
    }),
  getStaffMember: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/staff/:id" } })
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const staffMember = await ctx.prisma.staff.findUnique({
        where: { id: input.id, active: true },
      });
      if (!staffMember) throw new TRPCError(ServerError.STAFF_MEMBER_NOT_FOUND);
      return staffMember;
    }),
});
