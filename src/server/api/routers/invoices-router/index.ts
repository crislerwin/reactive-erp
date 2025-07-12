import { ServerError } from "@/common/errors";
import {
  createInvoiceSchema,
  customNumberValidator,
  updateInvoiceSchema,
} from "@/common/schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prepareJsonField } from "@/lib/db-helpers";

const superUserRoles = ["OWNER", "ADMIN", "MANAGER"];

export const invoicesRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ method: "POST", path: "/invoice" })
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);

      const total_items = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );
      const product = await ctx.prisma.product.findMany({
        where: {
          product_id: {
            in: input.items.map((item) => item.product_id),
          },
        },
      });
      if (product.length !== input.items.length)
        throw new TRPCError(ServerError.PRODUCT_QUANTITY_MISMATCH);

      return ctx.prisma.invoice.create({
        data: {
          branch_id: ctx.session.staffMember.branch_id,
          items: prepareJsonField(input.items),
          staff_id: input.staff_id,
          status: input.status,
          expires_at: input.expires_at,
          type: input.type,
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

      if (ctx.session.staffMember.role === "OWNER") {
        return ctx.prisma.invoice.findMany();
      }

      return ctx.prisma.invoice.findMany({
        where: {
          branch_id: ctx.session.staffMember.branch_id,
        },
      });
    }),

  update: protectedProcedure
    .meta({ method: "PUT", path: "/invoice/:id" })
    .input(updateInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);

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
          items: prepareJsonField(input.items),
          type: input.type,
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
