import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const createCompanyInput = z.object({
  cnpj: z.string(),
  socialReason: z.string(),
  fantasyName: z.string(),
  email: z.string(),
});

export type CreateCompanyInput = z.infer<typeof createCompanyInput>;

export const companiesRouter = createTRPCRouter({
  save: protectedProcedure
    .input(createCompanyInput)
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
    .input(z.object({ companyId: z.number() }))
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
    .input(z.object({ companyId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.company.delete({
        where: { id: input.companyId },
      });
      return true;
    }),
});
