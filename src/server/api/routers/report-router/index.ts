import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ServerError } from "@/common/errors/customErrors";

export const reportRouter = createTRPCRouter({
  getReports: protectedProcedure
    .meta({ method: "GET", path: "/report" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember)
        throw new TRPCError(ServerError.NOT_ALLOWED);

      const invoices = await ctx.prisma.invoice.findMany();
      const customers = await ctx.prisma.customer.findMany();

      const reportData = invoices.map((invoice) => {
        const date = invoice.created_at.toISOString().split("T")[0] as string;
        let invoiceCount = 0;
        let purchaseCount = 0;
        if (invoice.type === "sale") {
          invoiceCount += 1;
        }
        if (invoice.type === "purchase") {
          purchaseCount += 1;
        }
        return {
          date,
          purchase: purchaseCount,
          sale: invoiceCount,
          customers: customers.length,
        };
      }, 0);

      return reportData;
    }),
});
