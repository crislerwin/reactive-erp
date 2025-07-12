import { useState } from "react";
import { trpc } from "@/utils/api";
import {
  Box,
  Card,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Select,
  TextInput,
  Loader,
} from "@mantine/core";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { createTRPCContext } from "@/server/api/trpc";
import type { DefaultPageProps } from "@/common/schemas";

type ReportsDemoProps = DefaultPageProps;

export default function ReportsDemo(_props: ReportsDemoProps) {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    period: "day" as "day" | "week" | "month",
    branchId: undefined as number | undefined,
  });

  // Report queries
  const {
    data: baseReport,
    isLoading: baseLoading,
    refetch: refetchBase,
  } = trpc.report.getReports.useQuery(dateRange);

  const {
    data: salesReport,
    isLoading: salesLoading,
    refetch: refetchSales,
  } = trpc.report.getDetailedSalesReport.useQuery(dateRange);

  const handleRefreshAll = () => {
    refetchBase().catch(console.error);
    refetchSales().catch(console.error);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (date: string | Date | number) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <Box p="md">
      <Stack spacing="lg">
        <Group position="apart">
          <div>
            <Title order={1}>Relatórios Avançados</Title>
            <Text color="dimmed">
              Demonstração das novas funcionalidades de relatórios
            </Text>
          </div>
          <Button onClick={handleRefreshAll}>Atualizar Todos</Button>
        </Group>

        {/* Filters */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Filtros
          </Title>
          <Group grow>
            <TextInput
              label="Data Inicial"
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
            />
            <TextInput
              label="Data Final"
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
            />
            <Select
              label="Período"
              value={dateRange.period}
              onChange={(value: "day" | "week" | "month") =>
                setDateRange((prev) => ({ ...prev, period: value || "day" }))
              }
              data={[
                { value: "day", label: "Diário" },
                { value: "week", label: "Semanal" },
                { value: "month", label: "Mensal" },
              ]}
            />
          </Group>
        </Card>

        {/* Overview */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Visão Geral
          </Title>
          {baseLoading ? (
            <Loader />
          ) : baseReport ? (
            <Stack spacing="md">
              <Group grow>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Total de Vendas
                  </Text>
                  <Title order={2}>
                    {baseReport.reduce((sum, item) => sum + item.sale, 0)}
                  </Title>
                  <Text size="xs" color="dimmed">
                    transações
                  </Text>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Receita Total
                  </Text>
                  <Title order={2}>
                    {formatCurrency(
                      baseReport.reduce(
                        (sum, item) => sum + (item.salesRevenue || 0),
                        0
                      )
                    )}
                  </Title>
                  <Text size="xs" color="dimmed">
                    em vendas
                  </Text>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Novos Clientes
                  </Text>
                  <Title order={2}>
                    {baseReport.reduce((sum, item) => sum + item.customers, 0)}
                  </Title>
                  <Text size="xs" color="dimmed">
                    no período
                  </Text>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Clientes Ativos
                  </Text>
                  <Title order={2}>
                    {baseReport.reduce(
                      (sum, item) => sum + (item.activeCustomers || 0),
                      0
                    )}
                  </Title>
                  <Text size="xs" color="dimmed">
                    únicos
                  </Text>
                </Card>
              </Group>
            </Stack>
          ) : (
            <Text>Nenhum dado disponível</Text>
          )}
        </Card>

        {/* Sales Report */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Relatório de Vendas Detalhado
          </Title>
          {salesLoading ? (
            <Loader />
          ) : salesReport ? (
            <Stack spacing="md">
              <Group grow>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Receita Total
                  </Text>
                  <Title order={3}>
                    {formatCurrency(salesReport.summary.totalRevenue)}
                  </Title>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Transações
                  </Text>
                  <Title order={3}>
                    {salesReport.summary.totalTransactions}
                  </Title>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Ticket Médio
                  </Text>
                  <Title order={3}>
                    {formatCurrency(salesReport.summary.averageOrderValue)}
                  </Title>
                </Card>
                <Card withBorder p="sm">
                  <Text size="sm" color="dimmed">
                    Clientes Únicos
                  </Text>
                  <Title order={3}>{salesReport.summary.uniqueCustomers}</Title>
                </Card>
              </Group>

              <div>
                <Title order={4} mb="sm">
                  Últimas 5 Vendas
                </Title>
                <Stack spacing="xs">
                  {salesReport.sales.slice(0, 5).map((sale) => (
                    <Card key={sale.id} withBorder p="sm">
                      <Group position="apart">
                        <div>
                          <Text weight={500}>{sale.customer.name}</Text>
                          <Text size="sm" color="dimmed">
                            {sale.customer.email}
                          </Text>
                          <Text size="sm" color="dimmed">
                            {formatDate(sale.date)} • {sale.items.length} itens
                          </Text>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <Text weight={700}>
                            {formatCurrency(sale.totalAmount)}
                          </Text>
                          <Text size="sm" color="dimmed">
                            {sale.status}
                          </Text>
                        </div>
                      </Group>
                    </Card>
                  ))}
                </Stack>
              </div>
            </Stack>
          ) : (
            <Text>Nenhum dado de vendas disponível</Text>
          )}
        </Card>

        {/* Summary Card */}
        <Card withBorder p="md">
          <Title order={3} mb="md">
            Resumo das Melhorias
          </Title>
          <Stack spacing="sm">
            <Text>
              ✅ <strong>Dados Reais:</strong> Valores monetários calculados a
              partir dos itens das faturas
            </Text>
            <Text>
              ✅ <strong>Métricas Avançadas:</strong> Clientes ativos, ticket
              médio, e análise de comportamento
            </Text>
            <Text>
              ✅ <strong>Filtros Flexíveis:</strong> Período
              (diário/semanal/mensal), filial, e data
            </Text>
            <Text>
              ✅ <strong>Performance Otimizada:</strong> Queries eficientes com
              agregação no banco de dados
            </Text>
            <Text>
              ✅ <strong>Compatibilidade:</strong> Mantém compatibilidade com
              componentes existentes
            </Text>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const context = await createTRPCContext(ctx);

  if (!context.session?.staffMember) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  return {
    props: {
      role: context.session.staffMember.role,
    },
  };
}
