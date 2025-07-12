# Report Router Documentation

## Overview

The Report Router provides comprehensive business intelligence and analytics capabilities for the reactive-erp system. It offers multiple endpoints for different types of reports with improved data structure, efficient queries, and meaningful business metrics.

## Features

- **Enhanced Data Aggregation**: More relevant business metrics beyond simple counts
- **Flexible Time Periods**: Support for daily, weekly, and monthly aggregations
- **Revenue Tracking**: Actual monetary values instead of just transaction counts
- **Customer Analytics**: Detailed customer behavior and acquisition metrics
- **Product Performance**: Sales performance by product with category insights
- **Branch Filtering**: Multi-branch support with optional branch-specific reports
- **Efficient Queries**: Optimized database queries with proper indexing
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Endpoints

### 1. Base Reports (`getReports`)

**Purpose**: Provides overview data compatible with existing chart components while adding enhanced metrics.

**Input Parameters**:
```typescript
{
  startDate?: string;     // ISO date string (default: 30 days ago)
  endDate?: string;       // ISO date string (default: today)
  branchId?: number;      // Optional branch filter
  period?: "day" | "week" | "month"; // Aggregation period (default: "day")
}
```

**Output Structure**:
```typescript
{
  date: string;           // Date key for the period
  purchase: number;       // Number of purchase transactions (backward compatibility)
  sale: number;          // Number of sale transactions (backward compatibility)
  customers: number;     // New customers acquired (backward compatibility)
  salesRevenue: number;  // Total sales revenue (NEW)
  purchaseAmount: number; // Total purchase amount (NEW)
  activeCustomers: number; // Unique customers who made purchases (NEW)
}[]
```

**Example Usage**:
```typescript
const { data: reports } = trpc.report.getReports.useQuery({
  startDate: "2024-01-01",
  endDate: "2024-01-31",
  period: "week",
  branchId: 1
});
```

### 2. Detailed Sales Report (`getDetailedSalesReport`)

**Purpose**: Comprehensive sales analytics with transaction details and customer information.

**Output Structure**:
```typescript
{
  summary: {
    totalRevenue: number;
    totalTransactions: number;
    averageOrderValue: number;
    uniqueCustomers: number;
  };
  sales: {
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
  }[];
}
```

**Example Usage**:
```typescript
const { data: salesReport } = trpc.report.getDetailedSalesReport.useQuery({
  startDate: "2024-01-01",
  endDate: "2024-01-31"
});

console.log(`Total Revenue: ${salesReport?.summary.totalRevenue}`);
console.log(`Average Order Value: ${salesReport?.summary.averageOrderValue}`);
```

### 3. Customer Report (`getCustomerReport`)

**Purpose**: Customer behavior analysis, lifetime value, and retention metrics.

**Output Structure**:
```typescript
{
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    averageCustomerValue: number;
    repeatCustomers: number;
  };
  customers: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: number | null;
    registrationDate: Date;
  }[];
}
```

**Key Insights**:
- Customer lifetime value
- Purchase frequency
- Customer acquisition over time
- Repeat customer identification

### 4. Product Report (`getProductReport`)

**Purpose**: Product performance analysis, inventory insights, and category performance.

**Output Structure**:
```typescript
{
  summary: {
    totalProducts: number;
    totalRevenue: number;
    totalQuantitySold: number;
    topSellingProduct: ProductReportItem | null;
  };
  products: {
    product_id: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    currentStock: number;
    price: number;
  }[];
}
```

**Key Insights**:
- Best-selling products
- Revenue per product
- Stock levels vs. sales performance
- Category performance

## Utility Functions

The report router includes several utility functions for data processing:

### Date and Time Utilities

```typescript
// Format dates by period
formatDateByPeriod(date: Date, period: "day" | "week" | "month"): string

// Create date filters for queries
createDateFilter(startDate?: string | Date, endDate?: string | Date): Prisma.DateTimeFilter

// Validate date ranges
validateDateRange(startDate?: string, endDate?: string): {
  start: Date;
  end: Date;
  isValid: boolean;
  error?: string;
}
```

### Data Processing Utilities

```typescript
// Calculate invoice totals from JSON items
calculateInvoiceTotal(itemsJson: string, fallbackTotal: number): number

// Parse invoice items
parseInvoiceItems(itemsJson: string): Array<{
  product_id?: number;
  name?: string;
  price: number;
  quantity: number;
}>

// Currency formatting
formatCurrency(amount: number, locale = "pt-BR", currency = "BRL"): string

// Statistical calculations
calculateStatistics(data: number[]): {
  mean: number;
  median: number;
  min: number;
  max: number;
  sum: number;
  count: number;
}
```

## Performance Optimizations

### Database Query Optimizations

1. **Selective Data Loading**: Only loads necessary fields and applies filters at the database level
2. **Date Range Filtering**: Uses indexed `created_at` fields for efficient time-based queries
3. **Branch Filtering**: Optional branch-specific filtering to reduce data volume
4. **Soft Delete Awareness**: Excludes deleted records with `deleted_at: null` filters

### Memory Efficiency

1. **Streaming Processing**: Processes data in streams rather than loading everything into memory
2. **Map-based Aggregation**: Uses JavaScript Maps for efficient data aggregation
3. **Lazy Evaluation**: Only calculates metrics when needed

### Caching Considerations

```typescript
// Example with caching
const { data, isLoading } = trpc.report.getReports.useQuery(
  { startDate, endDate, period },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
);
```

## Migration from Old Implementation

### Backward Compatibility

The new implementation maintains backward compatibility with existing chart components:

```typescript
// Old format still works
interface OldFormat {
  date: string;
  purchase: number;
  sale: number;
  customers: number;
}

// New format extends the old one
interface NewFormat extends OldFormat {
  salesRevenue: number;
  purchaseAmount: number;
  activeCustomers: number;
}
```

### Migration Steps

1. **Update imports**: Import new types from `report-router/types`
2. **Add new parameters**: Optionally use new input parameters for filtering
3. **Use new fields**: Take advantage of new fields like `salesRevenue` and `activeCustomers`
4. **Update UI components**: Enhance charts and displays with new metrics

## Example Implementation

### React Component Example

```typescript
import { trpc } from "@/utils/trpc";
import { formatCurrency } from "@/server/api/routers/report-router/utils";

function SalesReport() {
  const { data: salesReport, isLoading } = trpc.report.getDetailedSalesReport.useQuery({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    period: "day"
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Sales Summary</h2>
      <p>Total Revenue: {formatCurrency(salesReport?.summary.totalRevenue || 0)}</p>
      <p>Transactions: {salesReport?.summary.totalTransactions}</p>
      <p>Average Order Value: {formatCurrency(salesReport?.summary.averageOrderValue || 0)}</p>

      <h3>Recent Sales</h3>
      {salesReport?.sales.map(sale => (
        <div key={sale.id}>
          <span>{sale.customer.name}</span>
          <span>{formatCurrency(sale.totalAmount)}</span>
        </div>
      ))}
    </div>
  );
}
```

### Chart Integration Example

```typescript
function EnhancedChart({ data }: { data: BaseReportData[] }) {
  const totalRevenue = data.reduce((sum, item) => sum + (item.salesRevenue || 0), 0);
  const totalTransactions = data.reduce((sum, item) => sum + item.sale, 0);

  return (
    <div>
      <div className="summary">
        <span>Total Revenue: {formatCurrency(totalRevenue)}</span>
        <span>Total Transactions: {totalTransactions}</span>
      </div>
      <BarChart data={data} />
    </div>
  );
}
```

## Error Handling

### Input Validation

```typescript
// Date validation example
const { start, end, isValid, error } = validateDateRange(startDate, endDate);

if (!isValid && error) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: error,
  });
}
```

### Common Error Scenarios

1. **Invalid Date Ranges**: Automatic correction and validation
2. **Missing Data**: Graceful handling with default values
3. **JSON Parsing Errors**: Fallback to alternative data sources
4. **Database Connection Issues**: Proper error propagation
5. **Permission Errors**: Staff member validation

## Security Considerations

### Access Control

```typescript
// All endpoints require authenticated staff member
if (!ctx.session.staffMember) {
  throw new TRPCError(ServerError.NOT_ALLOWED);
}
```

### Data Filtering

- Branch-based data isolation
- Soft-delete respect
- Date range limitations
- Input sanitization

## Testing

### Unit Test Examples

```typescript
describe("Report Router", () => {
  test("should calculate invoice total correctly", () => {
    const itemsJson = JSON.stringify([
      { price: 10.00, quantity: 2 },
      { price: 15.50, quantity: 1 }
    ]);

    const total = calculateInvoiceTotal(itemsJson, 0);
    expect(total).toBe(35.50);
  });

  test("should format date by period", () => {
    const date = new Date("2024-01-15");

    expect(formatDateByPeriod(date, "day")).toBe("2024-01-15");
    expect(formatDateByPeriod(date, "month")).toBe("2024-01");
  });
});
```

### Integration Test Examples

```typescript
describe("Report API", () => {
  test("should return sales report", async () => {
    const report = await caller.report.getDetailedSalesReport({
      startDate: "2024-01-01",
      endDate: "2024-01-31"
    });

    expect(report).toHaveProperty("summary");
    expect(report).toHaveProperty("sales");
    expect(report.summary).toHaveProperty("totalRevenue");
  });
});
```

## Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket support for live data updates
2. **Export Functionality**: PDF and Excel export capabilities
3. **Advanced Filtering**: More granular filtering options
4. **Predictive Analytics**: Forecast and trend analysis
5. **Dashboard Templates**: Pre-built dashboard configurations
6. **Custom Metrics**: User-defined calculation formulas
7. **Automated Reports**: Scheduled report generation and email delivery

### Performance Improvements

1. **Data Warehousing**: Separate analytics database
2. **Materialized Views**: Pre-calculated summary tables
3. **Background Processing**: Async report generation for large datasets
4. **Caching Layers**: Redis-based caching for frequently accessed data

## Troubleshooting

### Common Issues

1. **Slow Performance**: Check date ranges and add appropriate indexes
2. **Memory Issues**: Implement pagination for large datasets
3. **Inconsistent Data**: Verify JSON parsing and data validation
4. **Missing Reports**: Check permissions and branch access

### Debug Tools

```typescript
// Enable query logging
const { data, isLoading, error } = trpc.report.getReports.useQuery(
  { startDate, endDate },
  {
    onError: (error) => console.error("Report error:", error),
    onSuccess: (data) => console.log("Report data:", data)
  }
);
```

## Conclusion

The enhanced Report Router provides a robust foundation for business intelligence in the reactive-erp system. It offers backward compatibility while introducing powerful new features for comprehensive business analysis.

For additional support or feature requests, please refer to the project's issue tracker or contact the development team.
