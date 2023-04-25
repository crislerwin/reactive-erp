import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
export const staffRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.staff.findMany();
  }),

  getUser: publicProcedure
    .input(
      z.object({
        email: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const staffMember = await ctx.prisma.staff.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!staffMember) throw new NotFoundError("User not found");

      if (!staffMember.userId) {
        const updatedUser = ctx.prisma.staff.update({
          where: {
            email: input.email,
          },
          data: {
            userId: input.userId,
          },
        });
        return updatedUser;
      }
      return staffMember;
    }),
  createUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        enterpriseId: z.string(),
        email: z.string(),
        name: z.string(),
        role: z.enum(["attendant", "doctor", "master"]),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.staff.create({
        data: {
          userId: input.userId,
          enterpriseId: input.enterpriseId,
          email: input.email,
          name: input.name,
        },
      });
    }),
  updateUser: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        email: z.string().optional(),
        name: z.string().optional(),
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
          name: input.name,
        },
      });
    }),
  addPermission: publicProcedure
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
  deleteUser: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.staff.delete({
      where: {
        userId: input,
      },
    });
  }),
});
