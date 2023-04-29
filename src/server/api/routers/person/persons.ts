import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const personRouter = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user.isSuperAdmin)
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not allowed to see all users",
        cause: "You are not allowed to see all users",
      });

    return ctx.prisma.person.findMany();
  }),

  getByEmail: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
    const loggedUser = await ctx.prisma.person.findUnique({
      where: {
        email: user.emailAddress,
      },
      include: {
        permissions: true,
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
    .input(
      z.object({
        companyId: z.number(),
        email: z.string(),
        userName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userAlreadyExists = await ctx.prisma.person.findUnique({
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
      const newUser = ctx.prisma.person.create({
        data: {
          companyId: input.companyId,
          email: input.email,
          userName: input.userName,
        },
      });
      return newUser;
    }),
  update: protectedProcedure
    .input(
      z.object({
        personId: z.number(),
        companyId: z.number().optional(),
        email: z.string().optional(),
        userName: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.person.update({
        where: {
          personId: input.personId,
        },
        data: {
          email: input.email,
          userName: input.userName,
          companyId: input.companyId,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        personId: z.number(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.person.delete({
        where: {
          personId: input.personId,
        },
      });
    }),

  addPermission: protectedProcedure
    .input(
      z.object({
        personId: z.number(),
        name: z.string(),
        value: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.person.update({
        where: {
          personId: input.personId,
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

  getByCompanyId: protectedProcedure
    .input(
      z.object({
        companyId: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      if (!ctx.session.user.isSuperAdmin)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to see all users",
          cause: "You are not allowed to see all users",
        });

      return ctx.prisma.person.findMany({
        where: {
          companyId: input.companyId,
        },
      });
    }),
  getById: protectedProcedure
    .input(
      z.object({
        personId: z.number(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.prisma.person.findUnique({
        where: {
          personId: input.personId,
        },
        include: {
          permissions: true,
        },
      });
    }),
});
