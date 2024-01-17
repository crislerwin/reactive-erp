import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { idSchema, updateInstitutionSchema } from "@/server/api/schemas";
import { PermissionTypes, findAndValidatePermission } from "../../auth";

export const institutionRouter = createTRPCRouter({
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
  upsert: protectedProcedure
    .input(updateInstitutionSchema)
    .mutation(async ({ ctx, input }) => {
      const isAllowedToUpsert = findAndValidatePermission(
        PermissionTypes.INSTITUTION_MANAGEMENT,
        ctx.session.user.permissions
      );
      if (!isAllowedToUpsert || !isAllowedToUpsert.value)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const institution = await ctx.prisma.institution.upsert({
        where: { company_code: input.company_code, id: input.id },
        create: {
          company_code: input.company_code,
          name: input.name,
          email: input.email,
          attributes: input.attributes,
          additional_info: input.additional_info,
          static_logo_url: input.static_logo_url,
        },
        update: {
          company_code: input.company_code,
          name: input.name,
          additional_info: input.additional_info,
          email: input.email,
          attributes: input.attributes,
          static_logo_url: input.static_logo_url,
        },
      });
      return institution;
    }),
});
