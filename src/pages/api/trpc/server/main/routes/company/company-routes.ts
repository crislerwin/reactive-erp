import { TRPCError } from "@trpc/server";
import {
  createCompanyInputValidation,
  findByIdInputValidation,
  updateCompanyInputValidation,
} from "./company-validation";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

export const companiesRouter = createTRPCRouter({
  save: protectedProcedure
    .input(createCompanyInputValidation)
    .mutation(async ({ ctx, input }) => {
      const newCompany = await ctx.prisma.company.create({
        data: {
          cnpj: input.cnpj,
          socialReason: input.socialReason,
          fantasyName: input.fantasyName,
          email: input.email,
        },
      });
      return newCompany;
    }),
  findById: protectedProcedure
    .input(findByIdInputValidation)
    .query(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.findUnique({
        where: { id: input.companyId },
      });
      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }
      return company;
    }),
  findAll: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.prisma.company.findMany();
    return companies;
  }),
  delete: protectedProcedure
    .input(findByIdInputValidation)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.company.delete({
        where: { id: input.companyId },
      });
      return true;
    }),
  update: protectedProcedure
    .input(updateCompanyInputValidation)
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.update({
        where: { id: input.companyId },
        data: {
          cnpj: input.cnpj,
          socialReason: input.socialReason,
          fantasyName: input.fantasyName,
          email: input.email,
        },
      });
      return company;
    }),
});
