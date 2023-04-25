import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
export const staffRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.staff.findMany();
  }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    if (!user.id) throw new NotFoundError("User not found");
    const staffMember = await ctx.prisma.staff.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!staffMember) {
      const createdUser = ctx.prisma.staff.create({
        data: {
          userId: user.id,
          email: user.emailAddress,
          userName: user.userName,
          type: "visitor",
        },
      });
      return createdUser;
    }

    return staffMember;
  }),
  createUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        enterpriseId: z.string(),
        email: z.string(),
        userName: z.string(),
        role: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.staff.create({
        data: {
          userId: input.userId,
          enterpriseId: input.enterpriseId,
          email: input.email,
          userName: input.userName,
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
      return ctx.prisma.staff.update({
        where: {
          email: input.email,
        },
        data: {
          userId: input.userId,
          email: input.email,
          userName: input.userName,
        },
      });
    }),
  addPermission: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        name: z.string(),
        value: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.staff.update({
        where: {
          userId: input.userId,
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
  deleteUser: protectedProcedure
    .input(z.string())
    .mutation(({ ctx, input }) => {
      return ctx.prisma.staff.delete({
        where: {
          userId: input,
        },
      });
    }),
});
