import * as React from "react";
import { trpc } from "@/utils/api";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { createTRPCContext } from "../server/api/trpc";

import { type Customer } from "@prisma/client";
import {
  type MRT_Row,
  type MRT_TableOptions,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { createCustomerSchema, updateCustomerSchema } from "../common/schemas";
import { updateQueryData } from "../lib";
import { getQueryKey } from "@trpc/react-query";
import { CrudTable } from "@/design-system";

export default function Customers({ role }: { role: string }) {
  const { data: customers = [], isLoading: isLoadingProducts } =
    trpc.customer.findAll.useQuery();
  const { mutate: createCustomer } = trpc.customer.create.useMutation();
  const { mutate: updateCustomer } = trpc.customer.update.useMutation();
  const { mutate: deleteCustomer, isLoading: isDeletingCustomer } =
    trpc.customer.delete.useMutation();

  const columns: MRT_ColumnDef<Customer>[] = [
    {
      accessorKey: "customer_id",
      header: "Id",
      enableEditing: false,
      size: 30,
    },
    {
      accessorKey: "first_name",
      header: "Nome",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
      },
    },
    {
      accessorKey: "last_name",
      header: "Sobrenome",
      mantineEditTextInputProps: {
        type: "text",
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      mantineEditTextInputProps: {
        type: "email",
      },
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      mantineEditTextInputProps: {
        type: "text",
      },
    },
    {
      accessorKey: "customer_code",
      header: "Código do Cliente",
      mantineEditTextInputProps: {
        type: "email",
      },
    },
  ];

  const handleCreateCustomer: MRT_TableOptions<Customer>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
      createCustomer(values, {
        onSuccess: (data) => {
          updateQueryData<Customer[]>(
            getQueryKey(trpc.customer.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return [...oldData, data];
            }
          );

          exitCreatingMode();
        },
      });
    };

  const handleUpdateCustomer: MRT_TableOptions<Customer>["onEditingRowSave"] =
    ({ values, exitEditingMode }) => {
      updateCustomer(values, {
        onSuccess: (data) => {
          updateQueryData<Customer[]>(
            getQueryKey(trpc.customer.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return oldData.map((oldCustomer) =>
                oldCustomer.customer_id === data.customer_id
                  ? data
                  : oldCustomer
              );
            }
          );
          exitEditingMode();
        },
      });
    };

  const handleDeleteCustomer = (row: MRT_Row<Customer>) => {
    deleteCustomer(
      { customer_id: row.original.customer_id },
      {
        onSuccess: () => {
          updateQueryData<Customer[]>(
            getQueryKey(trpc.customer.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return oldData.filter(
                (data) => data.customer_id !== row.original.customer_id
              );
            }
          );
        },
      }
    );
  };

  return (
    <CrudTable
      addButtonLabel="Novo Cliente"
      createModalLabel="Novo Cliente"
      editModalLabel="Editar Cliente"
      isLoading={isLoadingProducts}
      deleteModalProps={(row) => ({
        loading: isDeletingCustomer,
        title: "Deletar Cliente",
        children: `Vocé tem certeza que quer excluir o cliente ${row.original.first_name}?`,
        labels: { confirm: "Deletar", cancel: "Cancelar" },
      })}
      onCreatingRowSave={handleCreateCustomer}
      creationSchema={createCustomerSchema}
      updateSchema={updateCustomerSchema}
      onConfirmDelete={handleDeleteCustomer}
      onEditingRowSave={handleUpdateCustomer}
      columns={columns}
      data={customers}
    />
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

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
