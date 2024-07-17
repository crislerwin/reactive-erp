import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { CustomError } from "@/common/errors/customErrors";
import {
  createProductCategorySchema,
  updateProductCategorySchema,
} from "@/common/schemas/product-category.schema";
import { z } from "zod";

export const productCategory = createTRPCRouter({
  findAll: protectedProcedure
    .meta({ method: "GET", path: "/product-category" })
    .query(async ({ ctx }) => {
      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: ctx.session.account.branch_id },
      });
      if (!branch) throw new TRPCError(CustomError.BRANCH_NOT_FOUND);
      return ctx.prisma.productCategory.findMany({
        where: {
          branch_id: ctx.session.account.branch_id,
        },
      });
    }),
  createCategory: protectedProcedure
    .meta({ method: "POST", path: "/product-category" })
    .input(createProductCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.productCategory.create({
        data: {
          branch_id: input.branch_id ?? ctx.session.account.branch_id,
          name: input.name,
          active: input.active,
          description: input.description,
        },
      });
    }),
  updateCategory: protectedProcedure
    .meta({ method: "PUT", path: "/product-category" })
    .input(updateProductCategorySchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.productCategory.update({
        where: {
          id: input.id,
          branch_id: input.branch_id ?? ctx.session.account.branch_id,
        },
        data: {
          name: input.name,
          active: input.active,
          description: input.description,
        },
      });
    }),
  deleteCategory: protectedProcedure
    .meta({
      method: "DELETE",
      path: "/product-category/:id",
    })
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.productCategory.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
