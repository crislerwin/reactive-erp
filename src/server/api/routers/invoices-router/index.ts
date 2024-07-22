import { ServerError } from "@/common/errors";
import { createInvoiceSchema } from "@/common/schemas";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const superUserRoles = ["OWNER", "ADMIN"];

export const invoicesRouter = createTRPCRouter({
  create: protectedProcedure
    .meta({ method: "POST", path: "/invoice" })
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);
      if (!superUserRoles.includes(ctx.session.staffMember.role))
        throw new TRPCError({ code: "UNAUTHORIZED" });
      const total = input.items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);
      return ctx.prisma.invoice.create({
        data: {
          branch_id: ctx.session.staffMember.branch_id,
          items: input.items,
          staff_id: input.staff_id,
          status: input.status,
          expires_at: input.expires_at,
          total: total,
        },
      });
    }),
});
