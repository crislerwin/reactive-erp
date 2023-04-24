import { createTRPCRouter, publicProcedure } from "~/@/server/api/trpc";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getUser: publicProcedure
    .input(
      z.object({
        email: z.string(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          userId: input.userId,
          email: input.email,
        },
      });
      return user;
    }),
  createUser: publicProcedure
    .input(
      z.object({
        enterpriseId: z.string(),
        email: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        role: z.enum(["attendant", "doctor", "master"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          enterpriseId: input.enterpriseId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
        },
      });
    }),
  updateUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        role: z.enum(["attendant", "doctor", "admin", "master"]).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          email: input.email,
        },
        data: {
          userId: input.userId,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          role: input.role,
        },
      });
    }),
});
