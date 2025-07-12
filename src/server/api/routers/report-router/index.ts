import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { ServerError } from "@/common/errors/customErrors";
import { z } from "zod";
import {
  createDateFilter,
  formatDateByPeriod,
  calculateInvoiceTotal,
  parseInvoiceItems,
  validateDateRange,
} from "./utils";

const dateRangeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.number().optional(),
  period: z.enum(["day", "week", "month"]).default("day"),
});

export const reportRouter = createTRPCRouter({
  getReports: protectedProcedure
    .input(dateRangeSchema.optional())
    .meta({ method: "GET", path: "/report" })
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      const { startDate, endDate, branchId, period = "day" } = input || {};

      // Validate and prepare date range
      const { start, end, isValid, error } = validateDateRange(
        startDate,
        endDate
      );

      if (!isValid && error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error,
        });
      }

      const dateFilter = {
        created_at: createDateFilter(start, end),
      };

      const branchFilter = branchId ? { branch_id: branchId } : {};

      // Get invoices with customer data for the specified period
      const invoices = await ctx.prisma.invoice.findMany({
        where: {
          ...dateFilter,
          ...branchFilter,
          deleted_at: null,
        },
        include: {
          customer: true,
        },
        orderBy: {
          created_at: "asc",
        },
      });

      // Get customer acquisition data for the same period
      const newCustomers = await ctx.prisma.customer.findMany({
        where: {
          ...dateFilter,
          ...branchFilter,
          deleted_at: null,
        },
        select: {
          customer_id: true,
          created_at: true,
        },
      });

      // Aggregate data by the specified period
      const aggregatedData = new Map<
        string,
        {
          date: string;
          salesRevenue: number;
          salesCount: number;
          purchaseAmount: number;
          purchaseCount: number;
          newCustomers: number;
          activeCustomers: Set<number>;
        }
      >();

      // Use utility function for date formatting

      // Process invoices
      for (const invoice of invoices) {
        if (!invoice.created_at) continue;

        const dateKey = formatDateByPeriod(invoice.created_at, period);

        if (!aggregatedData.has(dateKey)) {
          aggregatedData.set(dateKey, {
            date: dateKey,
            salesRevenue: 0,
            salesCount: 0,
            purchaseAmount: 0,
            purchaseCount: 0,
            newCustomers: 0,
            activeCustomers: new Set(),
          });
        }

        const dayData = aggregatedData.get(dateKey);
        if (!dayData) continue;

        // Calculate invoice total using utility function
        const itemsTotal = calculateInvoiceTotal(
          invoice.items,
          invoice.total_items
        );

        if (invoice.type === "sale" && invoice.status === "paid") {
          dayData.salesRevenue += itemsTotal;
          dayData.salesCount += 1;
          dayData.activeCustomers.add(invoice.customer_id);
        } else if (invoice.type === "purchase") {
          dayData.purchaseAmount += itemsTotal;
          dayData.purchaseCount += 1;
        }
      }

      // Process new customers
      for (const customer of newCustomers) {
        if (!customer.created_at) continue;

        const dateKey = formatDateByPeriod(customer.created_at, period);

        if (!aggregatedData.has(dateKey)) {
          aggregatedData.set(dateKey, {
            date: dateKey,
            salesRevenue: 0,
            salesCount: 0,
            purchaseAmount: 0,
            purchaseCount: 0,
            newCustomers: 0,
            activeCustomers: new Set(),
          });
        }

        const dayData = aggregatedData.get(dateKey);
        if (!dayData) continue;
        dayData.newCustomers += 1;
      }

      // Convert to final format (maintaining backward compatibility)
      const reportData = Array.from(aggregatedData.values())
        .map((data) => ({
          date: data.date,
          purchase: data.purchaseCount, // Keep original field name for chart compatibility
          sale: data.salesCount, // Keep original field name for chart compatibility
          customers: data.newCustomers, // Keep original field name for chart compatibility
          // Additional fields with more meaningful data
          salesRevenue: data.salesRevenue,
          purchaseAmount: data.purchaseAmount,
          activeCustomers: data.activeCustomers.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return reportData;
    }),

  getDetailedSalesReport: protectedProcedure
    .input(dateRangeSchema.optional())
    .meta({ method: "GET", path: "/report/sales" })
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      const { startDate, endDate, branchId } = input || {};

      const { start, end, isValid, error } = validateDateRange(
        startDate,
        endDate
      );

      if (!isValid && error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error,
        });
      }

      const dateFilter = {
        created_at: createDateFilter(start, end),
      };

      const branchFilter = branchId ? { branch_id: branchId } : {};

      const salesData = await ctx.prisma.invoice.findMany({
        where: {
          ...dateFilter,
          ...branchFilter,
          type: "sale",
          status: "paid",
          deleted_at: null,
        },
        include: {
          customer: {
            select: {
              customer_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const processedSales = salesData.map((invoice) => {
        const itemsTotal = calculateInvoiceTotal(
          invoice.items,
          invoice.total_items
        );
        const itemsDetail = parseInvoiceItems(invoice.items);

        return {
          id: invoice.id,
          date: invoice.created_at,
          customer: {
            id: invoice.customer.customer_id,
            name: `${invoice.customer.first_name} ${
              invoice.customer.last_name || ""
            }`.trim(),
            email: invoice.customer.email,
          },
          items: itemsDetail,
          totalAmount: itemsTotal,
          status: invoice.status,
        };
      });

      const summary = {
        totalRevenue: processedSales.reduce(
          (sum, sale) => sum + sale.totalAmount,
          0
        ),
        totalTransactions: processedSales.length,
        averageOrderValue:
          processedSales.length > 0
            ? processedSales.reduce((sum, sale) => sum + sale.totalAmount, 0) /
              processedSales.length
            : 0,
        uniqueCustomers: new Set(processedSales.map((sale) => sale.customer.id))
          .size,
      };

      return {
        summary,
        sales: processedSales,
      };
    }),

  getCustomerReport: protectedProcedure
    .input(dateRangeSchema.optional())
    .meta({ method: "GET", path: "/report/customers" })
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      const { startDate, endDate, branchId } = input || {};

      const { start, end, isValid, error } = validateDateRange(
        startDate,
        endDate
      );

      if (!isValid && error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error,
        });
      }

      const dateFilter = {
        created_at: createDateFilter(start, end),
      };

      const branchFilter = branchId ? { branch_id: branchId } : {};

      // Get customer data with their order statistics
      const customers = await ctx.prisma.customer.findMany({
        where: {
          ...branchFilter,
          deleted_at: null,
        },
        include: {
          orders: {
            where: {
              type: "sale",
              status: "paid",
              deleted_at: null,
              ...dateFilter,
            },
          },
        },
      });

      const customerReport = customers
        .map((customer) => {
          const totalSpent = customer.orders.reduce((sum, order) => {
            return sum + calculateInvoiceTotal(order.items, order.total_items);
          }, 0);

          return {
            id: customer.customer_id,
            name: `${customer.first_name} ${customer.last_name || ""}`.trim(),
            email: customer.email,
            phone: customer.phone,
            totalOrders: customer.orders.length,
            totalSpent,
            averageOrderValue:
              customer.orders.length > 0
                ? totalSpent / customer.orders.length
                : 0,
            lastOrderDate:
              customer.orders.length > 0
                ? Math.max(
                    ...customer.orders.map((o) => o.created_at.getTime())
                  )
                : null,
            registrationDate: customer.created_at,
          };
        })
        .filter((customer) => customer.totalOrders > 0) // Only customers who made purchases in the period
        .sort((a, b) => b.totalSpent - a.totalSpent); // Sort by total spent descending

      const summary = {
        totalCustomers: customerReport.length,
        totalRevenue: customerReport.reduce(
          (sum, customer) => sum + customer.totalSpent,
          0
        ),
        averageCustomerValue:
          customerReport.length > 0
            ? customerReport.reduce(
                (sum, customer) => sum + customer.totalSpent,
                0
              ) / customerReport.length
            : 0,
        repeatCustomers: customerReport.filter(
          (customer) => customer.totalOrders > 1
        ).length,
      };

      return {
        summary,
        customers: customerReport,
      };
    }),

  getProductReport: protectedProcedure
    .input(dateRangeSchema.optional())
    .meta({ method: "GET", path: "/report/products" })
    .query(async ({ ctx, input }) => {
      if (!ctx.session.staffMember) {
        throw new TRPCError(ServerError.NOT_ALLOWED);
      }

      const { startDate, endDate, branchId } = input || {};

      const { start, end, isValid, error } = validateDateRange(
        startDate,
        endDate
      );

      if (!isValid && error) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: error,
        });
      }

      const dateFilter = {
        created_at: createDateFilter(start, end),
      };

      const branchFilter = branchId ? { branch_id: branchId } : {};

      // Get all sales invoices in the period
      const salesInvoices = await ctx.prisma.invoice.findMany({
        where: {
          ...dateFilter,
          ...branchFilter,
          type: "sale",
          status: "paid",
          deleted_at: null,
        },
      });

      // Get all products for reference
      const products = await ctx.prisma.product.findMany({
        where: {
          ...branchFilter,
          deleted_at: null,
        },
        include: {
          product_category: true,
        },
      });

      // Aggregate product sales data
      const productSales = new Map<
        number,
        {
          product_id: number;
          name: string;
          category: string;
          quantitySold: number;
          revenue: number;
          currentStock: number;
          price: number;
        }
      >();

      // Initialize products map
      for (const product of products) {
        productSales.set(product.product_id, {
          product_id: product.product_id,
          name: product.name,
          category: product.product_category.name,
          quantitySold: 0,
          revenue: 0,
          currentStock: product.stock,
          price: product.price,
        });
      }

      // Process sales data
      for (const invoice of salesInvoices) {
        const items = parseInvoiceItems(invoice.items);

        for (const item of items) {
          if (item.product_id) {
            const productData = productSales.get(item.product_id);
            if (productData) {
              productData.quantitySold += item.quantity;
              productData.revenue += item.price * item.quantity;
            }
          }
        }
      }

      const productReport = Array.from(productSales.values())
        .filter((product) => product.quantitySold > 0) // Only products that were sold
        .sort((a, b) => b.revenue - a.revenue); // Sort by revenue descending

      const summary = {
        totalProducts: productReport.length,
        totalRevenue: productReport.reduce(
          (sum, product) => sum + product.revenue,
          0
        ),
        totalQuantitySold: productReport.reduce(
          (sum, product) => sum + product.quantitySold,
          0
        ),
        topSellingProduct: productReport[0] || null,
      };

      return {
        summary,
        products: productReport,
      };
    }),
});
