import { ServerError } from "@/common/errors";
import {
  createInvoiceSchema,
  customNumberValidator,
  type InvoiceItem,
  updateInvoiceSchema,
} from "@/common/schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const superUserRoles = ["OWNER", "ADMIN", "MANAGER"];

export const invoicesRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ method: "POST", path: "/invoice" })
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const total_items = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      return ctx.prisma.invoice.create({
        data: {
          branch_id: ctx.session.staffMember.branch_id,
          items: input.items,
          staff_id: input.staff_id,
          status: input.status,
          expires_at: input.expires_at,
          customer_id: input.customer_id,
          total_items,
        },
      });
    }),
  getAll: protectedProcedure
    .meta({ method: "GET", path: "/invoices" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const invoices = await ctx.prisma.invoice.findMany({
        where: {
          branch_id: ctx.session.staffMember.branch_id,
        },
      });

      return invoices;
    }),
  getOne: protectedProcedure
    .meta({ method: "GET", path: "/invoice/:id" })
    .input(z.object({ id: customNumberValidator }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const invoice = await ctx.prisma.invoice.findUnique({
        where: {
          id: input.id,
        },
      });
      return { ...invoice, items: invoice?.items ?? ([] as InvoiceItem[]) };
    }),
  update: protectedProcedure
    .meta({ method: "PUT", path: "/invoice/:id" })
    .input(updateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const total_items = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      return ctx.prisma.invoice.update({
        where: {
          id: input.id,
        },
        data: {
          status: input.status,
          expires_at: input.expires_at,
          items: input.items,
          branch_id: ctx.session.staffMember.branch_id,
          customer_id: input.customer_id,
          staff_id: input.staff_id,
          total_items,
        },
      });
    }),
  delete: protectedProcedure
    .meta({ method: "DELETE", path: "/invoice/:id" })
    .input(z.object({ id: customNumberValidator }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      return ctx.prisma.invoice.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
