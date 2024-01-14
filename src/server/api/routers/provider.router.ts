import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  idSchema,
  providerSchema,
  updatePersonSchema,
} from "@/server/api/schemas";

export const providerRoute = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User Not found",
        cause: "No user",
      });

    return ctx.prisma.provider.findMany();
  }),

  save: protectedProcedure
    .input(providerSchema)
    .mutation(async ({ ctx, input }) => {
      const userAlreadyExists = await ctx.prisma.provider.findUnique({
        where: {
          email: input.email,
        },
      });
      if (userAlreadyExists) {
        throw new TRPCError({
          code: "FORBIDDEN",
          cause: "User already exists",
          message: "User already exists",
        });
      }
      const newUser = ctx.prisma.provider.create({
        data: {
          email: input.email,
          bio: input.bio,
          first_name: input.first_name,
          last_name: input.last_name,
          middle_name: input.middle_name,
          name: input.name,
        },
      });
      return newUser;
    }),
  update: protectedProcedure
    .input(updatePersonSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.provider.update({
        where: {
          id: input.id,
        },
        data: {
          email: input.email,
          name: input.name,
        },
      });
    }),

  delete: protectedProcedure.input(idSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.provider.delete({
      where: {
        id: input.id,
      },
    });
  }),

  getById: protectedProcedure.input(idSchema).query(({ ctx, input }) => {
    return ctx.prisma.provider.findUnique({
      where: {
        id: input.id,
      },
    });
  }),
});
