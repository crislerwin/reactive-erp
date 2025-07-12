export interface BaseReportData {
  date: string;
  purchase: number;
  sale: number;
  customers: number;
  salesRevenue: number;
  purchaseAmount: number;
  activeCustomers: number;
}

export interface SalesReportItem {
  id: number;
  date: Date;
  customer: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    product_id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalTransactions: number;
  averageOrderValue: number;
  uniqueCustomers: number;
}

export interface DetailedSalesReport {
  summary: SalesReportSummary;
  sales: SalesReportItem[];
}

export interface CustomerReportItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: number | null;
  registrationDate: Date;
}

export interface CustomerReportSummary {
  totalCustomers: number;
  totalRevenue: number;
  averageCustomerValue: number;
  repeatCustomers: number;
}

export interface CustomerReport {
  summary: CustomerReportSummary;
  customers: CustomerReportItem[];
}

export interface ProductReportItem {
  product_id: number;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  currentStock: number;
  price: number;
}

export interface ProductReportSummary {
  totalProducts: number;
  totalRevenue: number;
  totalQuantitySold: number;
  topSellingProduct: ProductReportItem | null;
}

export interface ProductReport {
  summary: ProductReportSummary;
  products: ProductReportItem[];
}

export interface DateRangeInput {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  period?: "day" | "week" | "month";
}
