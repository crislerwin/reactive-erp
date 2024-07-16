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
      if (superUserRoles.includes(ctx.session.account.role))
        return ctx.prisma.product.findMany();

      const branch = await ctx.prisma.branch.findUnique({
        where: {
          branch_id: ctx.session.account.branch_id,
          staff_members: { some: { id: ctx.session.account.id } },
        },
      });
      if (!branch)
        throw new TRPCError({ code: "NOT_FOUND", cause: "Branch not found" });

      return ctx.prisma.product.findMany({
        where: {
          branch_id: ctx.session.account.branch_id,
        },
      });
    }),
  create: protectedProcedure
    .meta({ method: "POST", path: "/product" })
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      if (!superUserRoles.includes(ctx.session.account.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      return ctx.prisma.product.create({
        data: {
          branch_id: ctx.session.account.branch_id,
          ...input,
        },
      });
    }),
  updateProduct: protectedProcedure
    .meta({ method: "PUT", path: "/product" })
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      if (!superUserRoles.includes(ctx.session.account.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      console.log(input);
      return ctx.prisma.product.update({
        where: { product_id: input.product_id },
        data: {
          name: input.name,
          price: input.price,
          description: input.description,
          available: input.available,
          branch_id: ctx.session.account.branch_id,
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
      if (!superUserRoles.includes(ctx.session.account.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });

      return ctx.prisma.product.delete({
        where: { product_id: input.product_id },
      });
    }),
});
