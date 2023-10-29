import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  createCompanySchema,
  idSchema,
  updateCompanySchema,
} from "./company-schema";

export const companiesRouter = createTRPCRouter({
  save: protectedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const existentCompany = await ctx.prisma.company.findUnique({
        where: { cnpj: input.cnpj },
      });

      if (existentCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Company already exists",
        });
      }
      return await ctx.prisma.company.create({
        data: {
          cnpj: input.cnpj,
          socialReason: input.socialReason,
          fantasyName: input.fantasyName,
          email: input.email,
        },
      });
    }),
  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const company = await ctx.prisma.company.findUnique({
      where: { id: input.id },
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
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.company.delete({
        where: { id: input.id },
      });
      return true;
    }),
  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.company.update({
        where: { id: input.id },
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
