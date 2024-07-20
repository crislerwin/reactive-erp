import * as React from "react";
import { trpc } from "@/utils/api";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { createTRPCContext } from "../server/api/trpc";
import { SideMenu } from "../components/SideMenu";
import { type Customer } from "@prisma/client";
import {
  type MRT_Row,
  type MRT_TableOptions,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { createCustomerSchema, updateCustomerSchema } from "../common/schemas";
import { validateData } from "../common/utils";
import { updateQueryData } from "../lib";
import { getQueryKey } from "@trpc/react-query";
import { modals } from "@mantine/modals";
import { Table } from "../design-system";

export default function Customers({ role }: { role: string }) {
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string | undefined>
  >({});
  const { data: customers = [], isLoading: isLoadingProducts } =
    trpc.customer.findAll.useQuery();
  const { mutate: createCustomer } = trpc.customer.create.useMutation();
  const { mutate: updateCustomer } = trpc.customer.update.useMutation();
  const { mutate: deleteCustomer, isLoading: isDeletingCustomer } =
    trpc.customer.delete.useMutation();

  const columns = React.useMemo<MRT_ColumnDef<Customer>[]>(
    () => [
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
          error: validationErrors?.first_name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              first_name: undefined,
            }),
        },
      },
      {
        accessorKey: "last_name",
        header: "Sobrenome",
        mantineEditTextInputProps: {
          type: "text",
          error: validationErrors?.price,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              last_name: undefined,
            }),
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        mantineEditTextInputProps: {
          type: "email",
          error: validationErrors?.email,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
      {
        accessorKey: "phone",
        header: "Telefone",
        mantineEditTextInputProps: {
          type: "text",
          error: validationErrors?.phone,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              phone: undefined,
            }),
        },
      },
      {
        accessorKey: "customer_code",
        header: "Código do Cliente",
        mantineEditTextInputProps: {
          type: "email",
          error: validationErrors?.description,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              description: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const handleCreateCustomer: MRT_TableOptions<Customer>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
      const newValidationErrors = validateData(values, createCustomerSchema);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      createCustomer(values, {
        onSuccess: (data) => {
          updateQueryData<Customer[]>(
            getQueryKey(trpc.product.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return [...oldData, data];
            }
          );
          setValidationErrors({});
          exitCreatingMode();
        },
      });
    };

  const handleUpdateCustomer: MRT_TableOptions<Customer>["onEditingRowSave"] =
    ({ values, exitEditingMode }) => {
      const newValidationErrors = validateData(values, updateCustomerSchema);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      updateCustomer(values, {
        onSuccess: (data) => {
          updateQueryData<Customer[]>(
            getQueryKey(trpc.product.findAll, undefined, "query"),
            (oldData) => {
              if (!oldData) return [];
              return oldData.map((oldCustomer) =>
                oldCustomer.customer_id === data.customer_id
                  ? data
                  : oldCustomer
              );
            }
          );
          setValidationErrors({});
          exitEditingMode();
        },
      });
    };

  const openDeleteConfirmModal = (row: MRT_Row<Customer>) => {
    modals.openConfirmModal({
      title: "Deletar Cliente",
      children: `Vocé tem certeza que quer excluir o cliente ${row.original.first_name}?`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: {
        variant: "filled",
        disabled: isDeletingCustomer,
      },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteCustomer(
          { customer_id: row.original.customer_id },
          {
            onSuccess: () => {
              updateQueryData<Customer[]>(
                getQueryKey(trpc.product.findAll, undefined, "query"),
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
      },
    });
  };

  return (
    <SideMenu role={role}>
      <Table
        addButtonLabel="Novo Cliente"
        createModalLabel="Novo Cliente"
        editModalLabel="Editar Cliente"
        isLoading={isLoadingProducts}
        openDeleteConfirmModal={openDeleteConfirmModal}
        tableOptions={{
          onCreatingRowSave: handleCreateCustomer,
          onEditingRowSave: handleUpdateCustomer,
        }}
        columns={columns}
        data={customers}
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

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
