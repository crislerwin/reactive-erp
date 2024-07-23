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
      const products = await ctx.prisma.product.findMany({
        where: {
          product_id: {
            in: input.items.map((item) => item.product_id),
          },
        },
      });
      const productMap = new Map(
        products.map((product) => [product.product_id, product])
      );
      const total_price = input.items.reduce((acc, item) => {
        const product = productMap.get(item.product_id);
        if (!product) throw new TRPCError(ServerError.PRODUCT_NOT_FOUND);
        return acc + product.price * item.quantity;
      }, 0);
      const total_items = input.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      return ctx.prisma.invoice.create({
        data: {
          branch_id: ctx.session.staffMember.branch_id,
          items: input.items,
          staff_id: input.staff_id,
          status: input.status,
          expires_at: input.expires_at,
          customer_id: input.customer_id,
          total_items,
          total_price,
        },
      });
    }),
});
