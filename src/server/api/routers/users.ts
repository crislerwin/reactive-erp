import { createTRPCRouter, publicProcedure } from "~/@/server/api/trpc";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getUser: publicProcedure
    .input(z.object({ email: z.string(), enterpriseId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: {
          email: input.email,
          enterpriseId: input.enterpriseId,
        },
      });
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
        firstName: z.string(),
        lastName: z.string(),
        role: z.enum(["attendant", "doctor", "admin", "master"]),
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
