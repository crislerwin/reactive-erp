"use client";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";

const chartConfig = {
  purchase: {
    label: "Compras",
    color: "hsl(var(--chart-1))",
    theme: {
      light: "hsl(var(--chart-1))",
      dark: "hsl(var(--chart-1))",
    },
  },
  sale: {
    label: "Vendas",
    color: "hsl(var(--chart-2))",
    theme: {
      light: "hsl(var(--chart-2))",
      dark: "hsl(var(--chart-2))",
    },
  },
  customers: {
    label: "Clientes",
    color: "hsl(var(--chart-2))",
    theme: {
      light: "hsl(var(--chart-2))",
      dark: "hsl(var(--chart-2))",
    },
  },
} satisfies ChartConfig;

export default function ChartComponent({
  data: chartData,
}: {
  data: {
    date: string;
    purchase: number;
    sale: number;
    customers: number;
  }[];
}) {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("purchase");

  const total = React.useMemo(
    () => ({
      purchase: chartData.reduce((acc, curr) => acc + curr.purchase, 0),
      sale: chartData.reduce((acc, curr) => acc + curr.sale, 0),
      customers: chartData.reduce((acc, curr) => acc + curr.customers, 0),
    }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className=" flex flex-col items-stretch space-y-0 border-b p-0  dark:border-gray-600 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Total</CardTitle>
          <CardDescription>
            Visualize o desempenho de compra, vendas e clientes
          </CardDescription>
        </div>
        <div className="flex">
          {Object.keys(chartConfig).map((key) => {
            const chart = key as keyof typeof chartConfig;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-10 flex flex-1 flex-col justify-center gap-1 border-t px-6  py-4 text-left even:border-l data-[active=true]:bg-muted/50 dark:border-gray-600 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value);
                return date.toLocaleDateString("pt-BR", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px] bg-slate-100 text-slate-900 dark:bg-gray-800 dark:text-slate-300"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(String(value)).toLocaleDateString("pt-Br", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
