import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createStaffMemberSchema, updateStaffMemberSchema } from "./schemas";
import { z } from "zod";

const allowedRoles = ["ADMIN", "MANAGER"];

export const staffRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/staff" })
    .query(async ({ ctx }) => {
      if (ctx.session.account.role === "OWNER")
        return ctx.prisma.staff.findMany({ where: { deleted_at: null } });

      if (!allowedRoles.includes(ctx.session.account.role))
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: "You are not allowed to perform this action",
        });

      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: ctx.session.account.branch_id },
      });
      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });

      return ctx.prisma.staff.findMany({
        where: {
          branch_id: ctx.session.account.branch_id,
          role: { in: allowedRoles },
        },
      });
    }),
  createStaffMember: protectedProcedure
    .meta({ openapi: { method: "POST", path: "/staff" } })
    .input(createStaffMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: input.branch_id },
      });

      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });
      const staffMember = await ctx.prisma.staff.findUnique({
        where: { email: input.email },
      });
      if (staffMember)
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "Account already exists",
        });

      return ctx.prisma.staff.create({
        data: {
          email: input.email,
          branch_id: input.branch_id,
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
      return ctx.prisma.staff.update({
        where: {
          id: input.staff_id,
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const staffToDelete = await ctx.prisma.staff.findUnique({
        where: { id: input.id, active: true },
      });
      if (!staffToDelete)
        throw new TRPCError({
          code: "NOT_FOUND",
          cause: "Staff member not found",
        });
      if (staffToDelete.role === "OWNER")
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: "You cannot delete an owner",
        });

      if (
        staffToDelete.role === "ADMIN" &&
        ctx.session.account.role !== "OWNER"
      ) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          cause: "You are not allowed to perform this action",
        });
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
      if (!staffMember)
        throw new TRPCError({
          code: "NOT_FOUND",
          cause: "Staff member not found",
        });
      return staffMember;
    }),
});
