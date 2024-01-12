import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getByIdSchema,
  createPersonSchema,
  updatePersonSchema,
} from "./person-schema";

export const personRouter = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User Not found",
        cause: "No user",
      });

    return ctx.prisma.person.findMany();
  }),

  getLoggedUser: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User Not found",
        cause: "No user",
      });
    const loggedUserEmail = ctx.session.user?.emailAddresses?.[0]?.emailAddress;
    const existentUser = await ctx.prisma.person.findUnique({
      where: {
        email: loggedUserEmail,
      },
    });
    if (!existentUser) {
      throw new TRPCError({
        code: "NOT_FOUND",
        cause: "User not found",
        message: "User not found",
      });
    }

    return ctx.session.user;
  }),
  getByEmail: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user.id) throw new TRPCError({ code: "UNAUTHORIZED" });
    const loggedUser = await ctx.prisma.person.findUnique({
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
          id: input.id,
          email: input.email,
          userName: input.userName,
        },
      });
      return newUser;
    }),
  update: protectedProcedure
    .input(updatePersonSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.person.update({
        where: {
          id: input.id,
        },
        data: {
          email: input.email,
          userName: input.userName,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.person.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getById: protectedProcedure.input(getByIdSchema).query(({ ctx, input }) => {
    return ctx.prisma.person.findUnique({
      where: {
        id: input.id,
      },
    });
  }),
});
