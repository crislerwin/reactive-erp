import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export const usersRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user.id) throw new NotFoundError("User not found");
    const loggedUser = await ctx.prisma.user.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!loggedUser) {
      const createdUser = ctx.prisma.user.create({
        data: {
          userId: user.id,
          email: user.emailAddress,
          userName: user.userName,
          type: "visitor",
        },
      });
      return createdUser;
    }

    return loggedUser;
  }),
  createUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        enterpriseId: z.string(),
        email: z.string(),
        userName: z.string(),
        type: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.create({
        data: {
          userId: input.userId,
          enterpriseId: input.enterpriseId,
          email: input.email,
          userName: input.userName,
          type: input.type,
        },
      });
    }),
  updateUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string().optional(),
        userName: z.string().optional(),
        role: z.enum(["attendant", "doctor", "admin", "master"]).optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          userId: input.userId,
        },
        data: {
          userId: input.userId,
          email: input.email,
          userName: input.userName,
        },
      });
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.delete({
        where: {
          userId: input.userId,
        },
      });
    }),

  addUserPermission: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        value: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          userId: input.userId,
        },
        include: {
          permissions: true,
        },
        data: {
          permissions: {
            create: {
              name: input.name,
              value: input.value,
            },
          },
        },
      });
    }),

  getAllByEnterpriseId: protectedProcedure
    .input(
      z.object({
        enterpriseId: z.string(),
        isAllowedToSeeAll: z.boolean(),
      })
    )
    .query(({ ctx, input }) => {
      if (!input.isAllowedToSeeAll)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to see all users",
          cause: "You are not allowed to see all users",
        });

      return ctx.prisma.user.findMany({
        where: {
          enterpriseId: input.enterpriseId,
        },
      });
    }),
  getUserPermissions: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: {
          userId: input.userId,
        },
        include: {
          permissions: true,
        },
      });
    }),
});
