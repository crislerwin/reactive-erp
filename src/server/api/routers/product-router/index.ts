import { ServerError } from "@/common/errors";
import {
  createProductSchema,
  updateProductSchema,
  customNumberValidator,
} from "@/common/schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const superUserRoles = ["ADMIN", "OWNER"];

export const productRouter = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/products" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (superUserRoles.includes(ctx.session.staffMember.role))
        return ctx.prisma.product.findMany();

      const branch = await ctx.prisma.branch.findUnique({
        where: {
          branch_id: ctx.session.staffMember.branch_id,
          staff_members: { some: { id: ctx.session.staffMember.id } },
        },
      });
      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });

      return ctx.prisma.product.findMany({
        where: {
          branch_id: ctx.session.staffMember.branch_id,
        },
      });
    }),
  create: protectedProcedure
    .meta({ method: "POST", path: "/product" })
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const productCategory = await ctx.prisma.productCategory.findUnique({
        where: { id: input.product_category_id },
      });
      if (!productCategory)
        throw new TRPCError(ServerError.PRODUCT_CATEGORY_NOT_FOUND);
      return ctx.prisma.product.create({
        data: {
          branch_id: ctx.session.staffMember.branch_id,
          ...input,
        },
      });
    }),
  updateProduct: protectedProcedure
    .meta({ method: "PUT", path: "/product" })
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);

      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError(ServerError.NOT_ALLOWED);

      return ctx.prisma.product.update({
        where: { product_id: input.product_id },
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          available: input.available,
          branch_id: ctx.session.staffMember.branch_id,
          product_id: input.product_id,
          product_category_id: input.product_category_id,
          stock: input.stock,
          colors: input.colors,
        },
      });
    }),
  deleteProduct: protectedProcedure
    .meta({ method: "DELETE", path: "/product" })
    .input(z.object({ product_id: customNumberValidator }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);

      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      return ctx.prisma.product.delete({
        where: { product_id: input.product_id },
      });
    }),
});
