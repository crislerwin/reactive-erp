import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createBranchSchema, updateBranchSchema } from "@/common/schemas";
import { ServerError } from "@/common/errors/customErrors";
import { ModelHelpers, processDbRecords } from "@/lib/db-helpers";

const allowedRoles = ["ADMIN", "MANAGER", "OWNER"];

const validateRole = (role: string) => {
  if (!allowedRoles.includes(role))
    throw new TRPCError(ServerError.NOT_ALLOWED);
};

export const branchRouter = createTRPCRouter({
  findAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.staffMember) throw new TRPCError(ServerError.NOT_ALLOWED);
    validateRole(ctx.session.staffMember.role);

    const branches = await ctx.prisma.branch.findMany();

    // Process JSON fields for cross-database compatibility
    return processDbRecords(branches, ["attributes"]);
  }),

  findById: protectedProcedure
    .input(z.object({ branch_id: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(ctx.session.staffMember.role);

      const branch = await ctx.prisma.branch.findUnique({
        where: { branch_id: input.branch_id },
      });

      if (!branch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Branch not found",
        });
      }

      // Process JSON fields for the single record
      return ModelHelpers.processBranch(branch);
    }),

  createBranch: protectedProcedure
    .input(createBranchSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(ctx.session.staffMember.role);

      // Prepare data for database insertion (handles JSON serialization)
      const preparedData = ModelHelpers.prepareBranch({
        name: input.name,
        attributes: input.attributes,
      });

      const newBranch = await ctx.prisma.branch.create({
        data: preparedData,
      });

      // Process the returned data for consistency
      return ModelHelpers.processBranch(newBranch);
    }),

  deleteBranch: protectedProcedure
    .input(z.object({ branch_id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(ctx.session.staffMember.role);

      const usersInBranch = await ctx.prisma.staff.findMany({
        where: { branch_id: input.branch_id },
      });

      if (usersInBranch.length > 0)
        throw new TRPCError(ServerError.BRANCH_NOT_EMPTY);

      const deletedBranch = await ctx.prisma.branch.update({
        where: { branch_id: input.branch_id },
        data: { deleted_at: new Date() },
      });

      return ModelHelpers.processBranch(deletedBranch);
    }),

  updateBranch: protectedProcedure
    .input(updateBranchSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(ctx.session.staffMember.role);

      // Prepare data for database update (handles JSON serialization)
      const preparedData = ModelHelpers.prepareBranch({
        name: input.name,
        attributes: input.attributes,
      });

      const updatedBranch = await ctx.prisma.branch.update({
        where: { branch_id: input.branch_id },
        data: preparedData,
      });

      // Process the returned data for consistency
      return ModelHelpers.processBranch(updatedBranch);
    }),

  // Example of a more complex query with JSON field filtering
  findByAttributes: protectedProcedure
    .input(
      z.object({
        attributeKey: z.string(),
        attributeValue: z.unknown().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      validateRole(ctx.session.staffMember.role);

      // For SQLite, we need to handle JSON searching differently
      // This is a simplified example - in practice, you might want more sophisticated JSON querying
      const branches = await ctx.prisma.branch.findMany();

      // Process all records first
      const processedBranches = processDbRecords(branches, ["attributes"]);

      // Filter based on attributes (client-side filtering for SQLite compatibility)
      const filteredBranches = processedBranches.filter((branch) => {
        if (!branch.attributes) return false;

        const attributes =
          typeof branch.attributes === "string"
            ? (JSON.parse(branch.attributes) as Record<string, unknown>)
            : (branch.attributes as Record<string, unknown>);

        if (input.attributeValue !== undefined) {
          return attributes[input.attributeKey] === input.attributeValue;
        }

        return input.attributeKey in attributes;
      });

      return filteredBranches;
    }),
});
