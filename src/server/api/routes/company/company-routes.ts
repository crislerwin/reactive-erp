import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  createCompanySchema,
  idSchema,
  updateCompanySchema,
} from "./office-schema";

export const companyRoutes = createTRPCRouter({
  save: protectedProcedure
    .input(createCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const existentCompany = await ctx.prisma.office.findUnique({
        where: { registrationId: input.registrationId },
      });

      if (existentCompany) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Company already exists",
        });
      }
      return await ctx.prisma.office.create({
        data: {
          registrationId: input.registrationId,
          socialReason: input.socialReason,
          fantasyName: input.fantasyName,
          email: input.email,
          phoneNumber: input.phoneNumber,
        },
      });
    }),
  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const office = await ctx.prisma.office.findUnique({
      where: { id: input.id },
    });
    if (!office) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Office not found",
      });
    }
    return office;
  }),

  findAll: protectedProcedure.query(async ({ ctx }) => {
    const companies = await ctx.prisma.office.findMany();
    return companies;
  }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.office.delete({
        where: { id: input.id },
      });
      return true;
    }),
  update: protectedProcedure
    .input(updateCompanySchema)
    .mutation(async ({ ctx, input }) => {
      const office = await ctx.prisma.office.update({
        where: { id: input.id },
        data: {
          registrationId: input.registrationId,
          socialReason: input.socialReason,
          fantasyName: input.fantasyName,
          email: input.email,
        },
      });
      return office;
    }),
});
