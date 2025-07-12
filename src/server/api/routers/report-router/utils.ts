import type { Prisma } from "@prisma/client";

export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface BranchFilter {
  branchId?: number;
}

/**
 * Creates a date filter for Prisma queries
 */
export function createDateFilter(
  startDate?: string | Date,
  endDate?: string | Date
): Prisma.DateTimeFilter {
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  return {
    gte: startDate ? new Date(startDate) : defaultStartDate,
    lte: endDate ? new Date(endDate) : defaultEndDate,
  };
}

/**
 * Creates a branch filter for Prisma queries
 */
export function createBranchFilter(
  branchId?: number
): Prisma.IntFilter | undefined {
  return branchId ? { equals: branchId } : undefined;
}

/**
 * Formats date based on the specified period grouping
 */
export function formatDateByPeriod(
  date: Date,
  period: "day" | "week" | "month"
): string {
  switch (period) {
    case "week": {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekStartString = weekStart.toISOString().split("T")[0];
      return weekStartString ?? "";
    }
    case "month":
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
    default: {
      const dateString = date.toISOString().split("T")[0];
      return dateString ?? "";
    }
  }
}

/**
 * Parses invoice items JSON and calculates total amount
 */
export function calculateInvoiceTotal(
  itemsJson: string,
  fallbackTotal: number
): number {
  try {
    const items = JSON.parse(itemsJson) as Array<{
      price: number;
      quantity: number;
    }>;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  } catch {
    return fallbackTotal;
  }
}

/**
 * Parses invoice items JSON and returns structured items
 */
export function parseInvoiceItems(itemsJson: string): Array<{
  product_id?: number;
  name?: string;
  price: number;
  quantity: number;
}> {
  try {
    return JSON.parse(itemsJson) as Array<{
      product_id?: number;
      name?: string;
      price: number;
      quantity: number;
    }>;
  } catch {
    return [];
  }
}

/**
 * Generates a complete date range for reporting (fills gaps)
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
  period: "day" | "week" | "month"
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(formatDateByPeriod(current, period));

    switch (period) {
      case "week":
        current.setDate(current.getDate() + 7);
        break;
      case "month":
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 1);
        break;
    }
  }

  return dates;
}

/**
 * Fills missing dates in report data with zero values
 */
export function fillMissingDates<T extends { date: string }>(
  data: T[],
  dateRange: string[],
  defaultValues: Omit<T, "date">
): T[] {
  const dataMap = new Map(data.map((item) => [item.date, item]));

  return dateRange.map((date) => {
    const existingData = dataMap.get(date);
    if (existingData) {
      return existingData;
    }
    return {
      date,
      ...defaultValues,
    } as T;
  });
}

/**
 * Calculates percentage change between two periods
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

/**
 * Formats currency for display
 */
export function formatCurrency(
  amount: number,
  locale = "pt-BR",
  currency = "BRL"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Calculates growth rate between two values
 */
export function calculateGrowthRate(
  current: number,
  previous: number
): {
  rate: number;
  isPositive: boolean;
  formatted: string;
} {
  const rate = calculatePercentageChange(current, previous);
  const isPositive = rate >= 0;
  const formatted = `${isPositive ? "+" : ""}${rate.toFixed(1)}%`;

  return {
    rate,
    isPositive,
    formatted,
  };
}

/**
 * Groups array of objects by a key function
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    const group = groups[key];
    if (group) {
      group.push(item);
    }
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Calculates moving average for a series of numbers
 */
export function calculateMovingAverage(
  data: number[],
  windowSize: number
): number[] {
  if (windowSize <= 0 || windowSize > data.length) {
    return data;
  }

  const result: number[] = [];

  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const average = window.reduce((sum, val) => sum + val, 0) / windowSize;
    result.push(average);
  }

  return result;
}

/**
 * Calculates standard statistical metrics for a dataset
 */
export function calculateStatistics(data: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  count: number;
} {
  if (data.length === 0) {
    return {
      mean: 0,
      median: 0,
      min: 0,
      max: 0,
      sum: 0,
      count: 0,
    };
  }

  const sorted = [...data].sort((a, b) => a - b);
  const sum = data.reduce((acc, val) => acc + val, 0);
  const mean = sum / data.length;
  const median =
    sorted.length % 2 === 0
      ? ((sorted[sorted.length / 2 - 1] ?? 0) +
          (sorted[sorted.length / 2] ?? 0)) /
        2
      : sorted[Math.floor(sorted.length / 2)] ?? 0;

  return {
    mean,
    median,
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    sum,
    count: data.length,
  };
}

/**
 * Creates a time-based aggregation key
 */
export function createTimeAggregationKey(
  date: Date,
  granularity: "hour" | "day" | "week" | "month" | "year"
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");

  switch (granularity) {
    case "hour":
      return `${year}-${month}-${day} ${hour}:00`;
    case "day":
      return `${year}-${month}-${day}`;
    case "week": {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `${weekStart.getFullYear()}-W${String(
        Math.ceil(weekStart.getDate() / 7)
      ).padStart(2, "0")}`;
    }
    case "month":
      return `${year}-${month}`;
    case "year":
      return String(year);
    default:
      return `${year}-${month}-${day}`;
  }
}

/**
 * Validates and sanitizes date inputs
 */
export function validateDateRange(
  startDate?: string,
  endDate?: string
): {
  start: Date;
  end: Date;
  isValid: boolean;
  error?: string;
} {
  const now = new Date();
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);

  let start = startDate ? new Date(startDate) : defaultStart;
  let end = endDate ? new Date(endDate) : now;

  // Validate dates
  if (Number.isNaN(start.getTime())) {
    return {
      start: defaultStart,
      end: now,
      isValid: false,
      error: "Invalid start date",
    };
  }

  if (Number.isNaN(end.getTime())) {
    return {
      start,
      end: now,
      isValid: false,
      error: "Invalid end date",
    };
  }

  // Ensure start is before end
  if (start > end) {
    [start, end] = [end, start];
  }

  // Ensure dates are not in the future
  if (start > now) {
    start = now;
  }
  if (end > now) {
    end = now;
  }

  return {
    start,
    end,
    isValid: true,
  };
}
