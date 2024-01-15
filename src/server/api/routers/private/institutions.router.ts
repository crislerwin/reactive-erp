import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  institutionSchema,
  idSchema,
  updateInstitutionSchema,
} from "@/server/api/schemas";

export const institutionRouter = createTRPCRouter({
  createOne: protectedProcedure
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
          additional_info: input.additional_info,
          provider_ids: input.provider_ids,
          static_logo_url: input.static_logo_url,
        },
      });
    }),
  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const institution = await ctx.prisma.institution.findUnique({
      where: { id: input.id },
    });
    if (!institution) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }
    return institution;
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
    .input(updateInstitutionSchema)
    .mutation(async ({ ctx, input }) => {
      const institution = await ctx.prisma.institution.update({
        where: { id: input.id },
        data: {
          company_code: input.company_code,
          name: input.name,
          additional_info: input.additional_info,
          email: input.email,
          provider_ids: input.provider_ids,
          attributes: input.attributes,
          static_logo_url: input.static_logo_url,
        },
      });
      return institution;
    }),
});
