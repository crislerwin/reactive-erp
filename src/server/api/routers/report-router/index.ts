import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ServerError } from "@/common/errors/customErrors";

export const reportRouter = createTRPCRouter({
  getReports: protectedProcedure
    .meta({ method: "GET", path: "/report" })
    .query(async ({ ctx }) => {
      if (!ctx.session.staffMember) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      const invoices = await ctx.prisma.invoice.findMany();
      const customers = await ctx.prisma.customer.findMany();

      const aggregatedData = invoices.reduce((acc, invoice) => {
        const date = invoice.created_at.toISOString().split("T")[0];
        if (!date) return acc;
        if (!acc[date]) {
          acc[date] = { purchase: new Set(), sale: new Set() };
        }
        if (invoice.type === "sale") {
          acc[date].sale.add(invoice.id);
        }
        if (invoice.type === "purchase") {
          acc[date].purchase.add(invoice.id);
        }
        return acc;
      }, {} as Record<string, { purchase: Set<number>; sale: Set<number> }>);

      // Convert aggregated data to the desired format
      const reportData = Object.entries(aggregatedData).map(
        ([date, counts]) => ({
          date,
          purchase: counts.purchase.size,
          sale: counts.sale.size,
          customers: customers.length,
        })
      );

      return reportData;
    }),
});
