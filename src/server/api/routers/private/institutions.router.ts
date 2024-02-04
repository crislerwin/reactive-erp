import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { idSchema, updateInstitutionSchema } from "@/server/api/validators";

export const institutionRouter = createTRPCRouter({
  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const institution = await ctx.prisma.institution.findUnique({
      where: { institution_id: input.id },
    });

    if (!institution) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Institution not found",
      });
    }
    return institution;
  }),

  findAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.institution.findMany();
  }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.institution.delete({
        where: { institution_id: input.id },
      });
    }),
  upsert: protectedProcedure
    .input(updateInstitutionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.institution.upsert({
        where: { institution_id: input.institution_id, email: input.email },
        create: {
          name: input.name,
          email: input.email,
          attributes: input.attributes,
          additional_info: input.additional_info,
          static_logo_url: input.static_logo_url,
        },
        update: {
          name: input.name,
          additional_info: input.additional_info,
          email: input.email,
          attributes: input.attributes,
          static_logo_url: input.static_logo_url,
        },
      });
    }),
});
