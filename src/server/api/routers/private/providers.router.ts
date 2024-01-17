import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { idSchema, updatePersonSchema } from "@/server/api/schemas";
import {
  PermissionTypes,
  findAndValidatePermission,
} from "../../auth/permissions";

export const providerRoute = createTRPCRouter({
  findAll: protectedProcedure.query(({ ctx }) => {
    if (!ctx.session.user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User Not found",
        cause: "No user",
      });

    return ctx.prisma.provider.findMany({
      where: {
        active: true,
      },
    });
  }),

  upsert: protectedProcedure
    .input(updatePersonSchema)
    .mutation(async ({ ctx, input }) => {
      const providerManagementPermission = findAndValidatePermission(
        PermissionTypes.PROVIDER_MANAGEMENT,
        ctx.session.user.permissions
      );
      if (
        !providerManagementPermission ||
        !providerManagementPermission.value
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
          cause: "No permission",
        });
      }
      let institutionIds: number[] = [];
      if (input.institution_ids) {
        const institutions = await ctx.prisma.institution.findMany({
          where: {
            id: {
              in: input.institution_ids,
            },
          },
        });
        if (institutions.length !== input.institution_ids.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            cause: "Invalid institution ids",
            message: "Invalid institution ids",
          });
        }

        institutionIds = institutions.map((institution) => institution.id);
      }
      return ctx.prisma.provider.upsert({
        where: {
          id: input.id,
          email: input.email,
        },
        create: {
          email: input.email,
          bio: input.bio,
          first_name: input.first_name,
          last_name: input.last_name,
          middle_name: input.middle_name,
          name: input.name,
          institution_ids: institutionIds,
        },
        update: {
          email: input.email,
          bio: input.bio,
          first_name: input.first_name,
          last_name: input.last_name,
          middle_name: input.middle_name,
          name: input.name,
          institution_ids: institutionIds,
        },
      });
    }),

  softDelete: protectedProcedure.input(idSchema).mutation(({ ctx, input }) => {
    return ctx.prisma.provider.update({
      where: {
        id: input.id,
      },
      data: {
        active: false,
        deleted_at: new Date(),
      },
    });
  }),

  findById: protectedProcedure.input(idSchema).query(async ({ ctx, input }) => {
    const selectedProvider = await ctx.prisma.provider.findUnique({
      where: {
        id: input.id,
        active: true,
      },
    });
    if (!selectedProvider) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Provider not found",
      });
    }
    return selectedProvider;
  }),
});
