import { trpc } from "@/utils/api";
import { SideBar } from "@/components/SideBar";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import React, { useMemo, useState } from "react";
import { MantineTable } from "@/components/Table";
import { MRT_EditActionButtons, type MRT_ColumnDef } from "mantine-react-table";
import { ActionIcon, Button, Flex, Stack, Title, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { type Provider } from "@prisma/client";

const validateRequired = (value: string | undefined) => !!value?.length;
const validateEmail = (email: string | undefined) =>
  !!email?.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

function validateProvider(provider: Record<string, string>) {
  return {
    firstName: !validateRequired(provider.first_name)
      ? "First Name is Required"
      : "",
    lastName: !validateRequired(provider.last_name)
      ? "Last Name is Required"
      : "",
    email: !validateEmail(provider.email) ? "Incorrect Email Format" : "",
  };
}

const useProviderColumns = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [
    isOpen,
    { close: closeDeleteConfirmModal, open: openDeleteConfirmModal },
  ] = useDisclosure();

  const makeColumns = (): MRT_ColumnDef<Record<string, unknown>>[] => [
    {
      accessorKey: "first_name",
      header: "Nome",
      size: 150,
      mantineEditTextInputProps: {
        type: "text",
        placeholder: "Nome",
        required: true,
        error: validationErrors.first_name,
        onFocus: () => {
          setValidationErrors({
            ...validationErrors,
            first_name: undefined,
          });
        },
      },
    },
    {
      accessorKey: "last_name",
      header: "Sobrenome",
      size: 150,
      mantineEditTextInputProps: {
        type: "text",
        placeholder: "Sobrenome",
        required: true,
        error: validationErrors.last_name,
        onFocus: () => {
          setValidationErrors({
            ...validationErrors,
            last_name: undefined,
          });
        },
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 150,
      mantineEditTextInputProps: {
        type: "email",
        placeholder: "Email",
        onFocus: () => {
          setValidationErrors({
            ...validationErrors,
            email: undefined,
          });
        },
      },
    },
  ];

  return {
    columns: useMemo(makeColumns, [validationErrors]),
    setValidationErrors,
    openDeleteConfirmModal,
    isOpen,
    closeDeleteConfirmModal,
  };
};
export default function Provider() {
  const {
    data: providers,
    isFetching: isFetchingProviders,
    isLoading: isLoadingProviders,
  } = trpc.provider.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { columns, setValidationErrors } = useProviderColumns();
  const isLoading = isLoadingProviders || isFetchingProviders;

  return (
    <SideBar>
      <div className="flex flex-col">
        <div className="mt-4 rounded-sm">
          <MantineTable
            enableEditing
            renderTopToolbarCustomActions={({ table }) => (
              <Button
                onClick={() => {
                  table.setCreatingRow(true);
                }}
              >
                Criar Novo
              </Button>
            )}
            onCreatingRowSave={({ values, table }) => {
              const newValidationErrors = validateProvider(values);
              if (Object.values(newValidationErrors).some((error) => error)) {
                setValidationErrors(newValidationErrors);
                return;
              }
              setValidationErrors({});
              console.log(values);
              table.setEditingRow(null);
            }}
            renderRowActions={({ row, table }) => (
              <Flex gap="md">
                <Tooltip label="Editar">
                  <ActionIcon
                    size="sm"
                    onClick={() => table.setEditingRow(row)}
                  >
                    <IconEdit />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Deletar">
                  <ActionIcon size="sm" color="red">
                    <IconTrash />
                  </ActionIcon>
                </Tooltip>
              </Flex>
            )}
            renderCreateRowModalContent={({
              internalEditComponents,
              row,
              table,
            }) => (
              <Stack>
                <Title order={3}>Criar Novo</Title>
                {internalEditComponents}
                <Flex justify="flex-end" mt="xl">
                  <MRT_EditActionButtons
                    variant="text"
                    table={table}
                    row={row}
                  />
                </Flex>
              </Stack>
            )}
            state={{ isLoading }}
            columns={columns}
            data={providers ?? []}
          />
        </div>
      </div>
    </SideBar>
  );
}

export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (userId) {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      destination: "/sign-in",
      permanent: false,
    },
  };
};
