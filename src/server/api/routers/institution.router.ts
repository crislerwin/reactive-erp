import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  institutionSchema,
  idSchema,
  updateCompanySchema,
} from "@/server/api/schemas";

export const institutionRouter = createTRPCRouter({
  save: protectedProcedure
    .input(institutionSchema)
    .mutation(async ({ ctx, input }) => {
      const existentCompany = await ctx.prisma.institution.findUnique({
        where: { company_code: input.company_code },
      });

      if (existentCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Institution ${existentCompany.name} already exists`,
        });
      }
      return await ctx.prisma.institution.create({
        data: {
          company_code: input.company_code,
          name: input.name,
          email: input.email,
          attributes: input.attributes,
          description: input.description,
        },
      });
    }),
  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const company = await ctx.prisma.institution.findUnique({
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
    const companies = await ctx.prisma.institution.findMany();
    return companies;
  }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.institution.delete({
        where: { id: input.id },
      });
      return true;
    }),
  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const company = await ctx.prisma.institution.update({
        where: { id: input.id },
        data: {
          company_code: input.company_code,
          name: input.name,
          description: input.description,
          email: input.email,
        },
      });
      return company;
    }),
});
