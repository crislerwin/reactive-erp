import { managerRoles } from "@/common/constants";
import {
  createInvoiceSchema,
  type InvoiceItem,
  updateInvoiceSchema,
} from "@/common/schemas";
import { Input } from "@/components/Input";
import { SideMenu } from "@/components/SideMenu";
import { SmartForm } from "@/components/SmartForm";
import { Button, CrudTable, type CrudTableProps } from "@/design-system";
import { updateQueryData } from "@/lib";
import { createTRPCContext } from "@/server/api/trpc";
import { trpc } from "@/utils/api";
import { ActionIcon, Flex, Grid, Stack, Title } from "@mantine/core";
import { type Invoice } from "@prisma/client";
import { getQueryKey } from "@trpc/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type MRT_ColumnDef, type MRT_Row } from "mantine-react-table";
import { useFieldArray } from "react-hook-form";
import { IconX } from "@tabler/icons-react";
import { type z } from "zod";

type InvoicesFormFields = {
  id: number;
  customer_id: number;
  staff_id: number;
  expires_at: string | undefined;
  status: string;
  total_items: number;
  total_price: number;
  items: InvoiceItem[];
};

const ProductForm = () => {
  const { fields, insert, remove } = useFieldArray<InvoicesFormFields>({
    name: "items",
  });
  const { data: products = [] } = trpc.product.findAll.useQuery();
  return (
    <Stack>
      {fields.map((field, index) => (
        <Grid align="center" key={field.id}>
          <Grid.Col span={6}>
            <Input.Select
              label="Produto"
              name={`items.${index}.product_id`}
              searchable
              limit={5}
              defaultValue={String(field.product_id)}
              data={products.map((product) => ({
                value: String(product.product_id),
                label: product.name,
              }))}
            />
          </Grid.Col>
          <Grid.Col span={5}>
            <Input.TextField
              label="Quantidade"
              type="number"
              name={`items.${index}.quantity`}
              defaultValue={field.quantity}
            />
          </Grid.Col>
          <Grid.Col className="mt-6" span={1}>
            <ActionIcon variant="default" aria-label="Deletar">
              <IconX onClick={() => remove(index)} />
            </ActionIcon>
          </Grid.Col>
        </Grid>
      ))}

      <Button
        className="w-full"
        variant="outline"
        onClick={() =>
          insert(fields.length, {
            product_id: 0,
            quantity: 0,
          })
        }
      >
        Adicionar Produto
      </Button>
    </Stack>
  );
};

const CreateInvoiceModalContent: CrudTableProps<InvoicesFormFields>["CustomCreateRowModalContent"] =
  ({ row, table, onSave, data }) => {
    const { data: customer = [] } = trpc.customer.findAll.useQuery();
    const { data: staff = [] } = trpc.staff.findAll.useQuery();

    const isEdit = !!row._valuesCache.id;

    const items = data.find((d) => d.id === row._valuesCache.id)?.items || [
      {
        product_id: 0,
        quantity: 0,
      },
    ];

    return (
      <SmartForm
        className="p-2"
        options={{
          resolver: zodResolver(
            isEdit ? updateInvoiceSchema : createInvoiceSchema
          ),
        }}
        defaultValues={{
          id: String(row._valuesCache.id || ""),
          customer_id: String(row._valuesCache.customer_id || ""),
          staff_id: String(row._valuesCache.staff_id || ""),
          expires_at: String(row._valuesCache.expires_at || ""),
          status: String(row._valuesCache.status || ""),
          items: items.map((item) => ({
            product_id: String(item.product_id),
            quantity: String(item.quantity),
          })),
        }}
        onSubmit={(values) => {
          onSave?.({
            row,
            table,
            values,
            exitOnSave: isEdit
              ? () => table.setEditingRow(null)
              : () => table.setCreatingRow(null),
          });
        }}
      >
        <Stack>
          <Title order={4}>{isEdit ? "Editar Pedido" : "Novo Pedido"}</Title>
          <Input.Select
            label="Cliente"
            name="customer_id"
            searchable
            limit={5}
            data={customer.map((customer) => ({
              value: String(customer.customer_id),
              label: customer.first_name,
            }))}
          />
          <Input.Select
            label="Vendedor"
            name="staff_id"
            searchable
            limit={5}
            data={staff.map((staff) => ({
              value: String(staff.id),
              label: staff.first_name,
            }))}
          />
          <Input.TextField label="Expira em" type="date" name="expires_at" />
          <Input.Select
            label="Status"
            name="status"
            data={[
              {
                value: "draft",
                label: "Rascunho",
              },
              {
                value: "pending",
                label: "Aguardando Pagamento",
              },
              {
                value: "paid",
                label: "Pago",
              },
              {
                value: "canceled",
                label: "Cancelado",
              },
            ]}
          />
          <ProductForm />
          <Flex justify="flex-end">
            <Flex className="w-44" justify="space-around">
              <Button
                onClick={() => {
                  isEdit
                    ? table.setEditingRow(null)
                    : table.setCreatingRow(null);
                }}
                color="danger"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button type="submit" variant="outline">
                Salvar
              </Button>
            </Flex>
          </Flex>
        </Stack>
      </SmartForm>
    );
  };

export default function InvoicesPage({ role }: { role: string }) {
  const { data: products = [], isLoading: isLoadingProducts } =
    trpc.invoice.getAll.useQuery();
  const { mutate: createInvoice } = trpc.invoice.create.useMutation();
  const { mutate: updateInvoice } = trpc.invoice.update.useMutation();
  const { mutate: deleteInvoice, isLoading: isDeletingProduct } =
    trpc.invoice.delete.useMutation();
  const { data: customers = [] } = trpc.customer.findAll.useQuery();
  const { data: staffs = [] } = trpc.staff.findAll.useQuery();

  const statusMap = {
    pending: "Aguardando Pagamento",
    paid: "Pago",
    draft: "Rascunho",
    canceled: "Cancelado",
  };

  const columns: MRT_ColumnDef<InvoicesFormFields>[] = [
    {
      accessorKey: "id",
      header: "ID",
      enableEditing: false,
      size: 30,
    },
    {
      accessorKey: "customer_id",
      header: "Cliente",
      Cell: ({ row }: { row: MRT_Row<InvoicesFormFields> }) => {
        const customer = customers.find(
          (customer) => customer.customer_id === row.original.customer_id
        );
        return <span>{customer?.first_name}</span>;
      },
    },
    {
      accessorKey: "staff_id",
      header: "Vendedor",
      Cell: ({ row }: { row: MRT_Row<InvoicesFormFields> }) => {
        const staff = staffs.find(
          (staff) => staff.id === row.original.staff_id
        );
        return <span>{staff?.first_name}</span>;
      },
    },
    {
      accessorKey: "total_items",
      header: "Quantidade",
    },
    {
      accessorKey: "total_price",
      header: "Valor Total",
      Cell: ({ row }: { row: MRT_Row<InvoicesFormFields> }) => {
        return (
          <span>
            {row.original.total_price.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ row }: { row: MRT_Row<InvoicesFormFields> }) => {
        return <span>{statusMap[row.original.status]}</span>;
      },
    },
    {
      accessorKey: "expires_at",
      header: "Expira em",
      Cell: ({ row }: { row: MRT_Row<InvoicesFormFields> }) => {
        const formattedDate = new Date(
          row.original.expires_at || ""
        ).toLocaleDateString("pt-BR");
        return <span>{formattedDate}</span>;
      },
      mantineEditTextInputProps: {
        type: "text",
      },
    },
  ];

  const handleCreateInvoice = ({
    values,
    exitCreatingMode,
  }: {
    values: z.infer<typeof createInvoiceSchema>;
    exitCreatingMode: () => void;
  }) => {
    createInvoice(values, {
      onSuccess: (data) => {
        updateQueryData<Invoice[]>(
          getQueryKey(trpc.invoice.getAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return [...oldData, data];
          }
        );

        exitCreatingMode();
      },
    });
  };

  const handleSaveInvoice = ({
    values,
    exitEditingMode,
  }: {
    values: z.infer<typeof updateInvoiceSchema>;
    exitEditingMode: () => void;
  }) => {
    updateInvoice(values, {
      onSuccess: (data) => {
        updateQueryData<Invoice[]>(
          getQueryKey(trpc.invoice.getAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((invoice) =>
              invoice.id === data.id ? data : invoice
            );
          }
        );
        exitEditingMode();
      },
    });
  };

  const handleDeleteInvoice = (row: MRT_Row<InvoicesFormFields>) => {
    deleteInvoice(
      { id: row.original.id },
      {
        onSuccess: () => {
          updateQueryData<Invoice[]>(
            getQueryKey(trpc.invoice.getAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return oldData.filter((data) => data.id !== row.original.id);
            }
          );
        },
      }
    );
  };

  return (
    <SideMenu role={role}>
      <CrudTable
        addButtonLabel="Nova Fatura"
        createModalLabel="Nova Fatura"
        editModalLabel="Editar Fatura"
        deleteModalProps={(row) => ({
          loading: isDeletingProduct,
          title: "Deletar Fatura",
          children: `Vocé tem certeza que quer excluír a fatura ${row.original.id}?`,
          labels: { confirm: "Deletar", cancel: "Cancelar" },
        })}
        isLoading={isLoadingProducts}
        onCreatingRowSave={handleCreateInvoice}
        onEditingRowSave={handleSaveInvoice}
        creationSchema={createInvoiceSchema}
        updateSchema={updateInvoiceSchema}
        onConfirmDelete={handleDeleteInvoice}
        columns={columns}
        CustomCreateRowModalContent={CreateInvoiceModalContent}
        data={products.map((product) => ({
          customer_id: product.customer_id,
          staff_id: product.staff_id,
          id: product.id,
          expires_at: product.expires_at.toISOString().split("T")[0],
          status: product.status || "",
          total_items: product.total_items,
          total_price: product.total_price,
          items: product.items as InvoiceItem[],
        }))}
      />
    </SideMenu>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const { session } = await createTRPCContext(ctx);
  const { staffMember, user } = session;
  if (!user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!staffMember) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }
  if (!managerRoles.includes(staffMember.role)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
