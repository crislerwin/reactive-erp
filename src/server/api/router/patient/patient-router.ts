import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  getByIdSchema,
  createPersonSchema,
  updatePersonSchema,
} from "./patient-schema";

export const patientRouter = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User Not found",
        cause: "No user",
      });

    return ctx.prisma.patient.findMany();
  }),

  getByEmail: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
    const loggedUser = await ctx.prisma.patient.findUnique({
      where: {
        email: user?.emailAddresses?.[0]?.emailAddress,
      },
    });
    if (!loggedUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        cause: "User not found",
        message: "User not found",
      });
    return loggedUser;
  }),
  save: protectedProcedure
    .input(createPersonSchema)
    .mutation(async ({ ctx, input }) => {
      const newUser = ctx.prisma.patient.create({
        data: {
          id: input.id,
          email: input.email,
          firstName: input.firstName,
        },
      });
      return newUser;
    }),
  update: protectedProcedure
    .input(updatePersonSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.patient.update({
        where: {
          id: input.id,
        },
        data: {
          email: input.email,
          firstName: input.firstName,
        },
      });
    }),

  delete: protectedProcedure.input(getByIdSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.patient.delete({
      where: {
        id: input.id,
      },
    });
  }),

  getById: protectedProcedure.input(getByIdSchema).query(({ ctx, input }) => {
    return ctx.prisma.patient.findUnique({
      where: {
        id: input.id,
      },
    });
  }),
});
