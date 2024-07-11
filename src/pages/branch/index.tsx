import { useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from "mantine-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { ActionIcon, Button, Flex, Stack, Title, Tooltip } from "@mantine/core";
import { IconEdit, IconNews, IconTrash } from "@tabler/icons-react";
import { type Branch } from "@prisma/client";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";

import { type ZodError } from "zod";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { createBranchSchema, updateBranchSchema } from "@/server/api/routers";
import { trpc } from "@/utils/api";

function validateStaffMember({
  branch,
  isCreating = true,
}: {
  branch: Branch;
  isCreating?: boolean;
}) {
  const errors: Record<string, string | undefined> = {};
  try {
    isCreating
      ? createBranchSchema.parse(branch)
      : updateBranchSchema.parse(branch);
  } catch (err) {
    const error = err as ZodError<Branch>;
    if (error.errors) {
      console.log(error.errors);
      error.errors.forEach((error) => {
        if (error.path) {
          errors[String(error.path)] = error.message;
        }
      });
    }
  }
  return errors;
}

const Table = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const {
    data: branches = [],
    isFetching: isFetchinsBranches,
    isError: isGettingStaffError,
  } = trpc.branch.findAll.useQuery(undefined, { refetchOnWindowFocus: false });
  const { mutate: createStaffMember, isLoading: isCreating } =
    trpc.staff.createStaffMember.useMutation();
  const { mutate: updateStaffMember, isLoading: isUpdating } =
    trpc.staff.updateStaffMember.useMutation();
  const { mutate: deleteStaffMember, isLoading: isDeleting } =
    trpc.staff.softDeletedStaffMember.useMutation();

  const columns = useMemo<MRT_ColumnDef<Branch>[]>(
    () => [
      {
        accessorKey: "branch_id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "name",
        header: "Nome",
        mantineEditTextInputProps: {
          type: "email",
          required: true,
          error: validationErrors?.firstName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              firstName: undefined,
            }),
        },
      },
      {
        accessorKey: "company_code",
        header: "CNPJ",
        mantineEditTextInputProps: {
          type: "email",
          error: validationErrors?.lastName,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              lastName: undefined,
            }),
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        enableEditing: !isEditing,
        mantineEditTextInputProps: {
          type: "email",
          required: true,
          error: validationErrors?.email,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              email: undefined,
            }),
        },
      },
    ],
    [isEditing, validationErrors]
  );
  const updateStaffListData = (newData: Branch, variables: Partial<Branch>) =>
    queryClient.setQueryData<Branch[] | undefined>(
      getQueryKey(trpc.staff.findAll, undefined, "query"),
      (oldData) => {
        if (!oldData) return;
        if (variables.branch_id) {
          return oldData.map((data) =>
            data.branch_id === variables.branch_id ? newData : data
          );
        }
        return [...oldData, newData];
      }
    );

  const handleErrors = (error: { message: string }) => {
    modals.open({
      title: `Ops! Ocorreu ao salver o usuário`,
      children: error.message,
      closeOnEscape: true,
    });
  };

  const handleCreateUser: MRT_TableOptions<Branch>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateStaffMember({
      branch: values,
    });
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    createStaffMember(
      {
        ...values,
        branch_id: Number(values.branch_id),
        active: Boolean(values.active),
        last_name: String(values.last_name ?? ""),
      },
      {
        onSuccess: updateStaffListData,
        onError: handleErrors,
      }
    );
    exitCreatingMode();
  };

  const handleSaveUser: MRT_TableOptions<Branch>["onEditingRowSave"] = ({
    values,
    table,
  }) => {
    const newValidationErrors = validateStaffMember({
      branch: values,
      isCreating: false,
    });
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateStaffMember(
      {
        ...values,
        id: Number(values.id),
        branch_id: Number(values.branch_id),
        active: values.active === "" || values.active === "true" ? true : false,
        last_name: String(values.last_name ?? ""),
      },
      {
        onSuccess: (data) => {
          updateStaffListData(data, { id: Number(data.id) });
          table.setEditingRow(null);
        },
        onError: handleErrors,
      }
    );
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<StaffType>) => {
    modals.openConfirmModal({
      title: "Deletar colaborador",
      children: `Vocé tem certeza que quer deletar o colaborador ${
        row.original.first_name
      } ${row.original.last_name ?? ""}`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { variant: "filled", color: "red" },
      cancelProps: { variant: "outline" },
      onConfirm: () =>
        deleteStaffMember(
          { id: Number(row.original.id) },
          {
            onSuccess: () => {
              queryClient.setQueryData<StaffType[] | undefined>(
                getQueryKey(trpc.staff.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return;
                  return oldData.filter((data) => data.id !== row.original.id);
                }
              );
            },
            onError: handleErrors,
          }
        ),
    });
  };

  const table = useMantineReactTable({
    columns,
    data: branches,
    localization: MRT_Localization_PT_BR,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: ({ branch_id }) => String(branch_id),
    mantineToolbarAlertBannerProps: isFetchinsBranches
      ? {
          color: "red",
          children: "Erro ao buscar usuários",
        }
      : undefined,
    mantineTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => {
      setIsEditing(false);
      setValidationErrors({});
    },
    onEditingRowSave: handleSaveUser,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Criar colaborador</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),

    renderRowActions: ({ row, table }) => {
      return (
        <>
          <Flex gap="md">
            <Tooltip label="Editar">
              <ActionIcon
                onClick={() => {
                  setIsEditing(true);
                  table.setEditingRow(row);
                }}
              >
                <IconEdit />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Excluir">
              <ActionIcon
                color="red"
                onClick={() => openDeleteConfirmModal(row)}
              >
                <IconTrash />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Tooltip withArrow label="Novo colaborador">
        <Button
          variant="outline"
          onClick={() => {
            table.setCreatingRow(true);
          }}
          rightIcon={<IconNews />}
        >
          Novo
        </Button>
      </Tooltip>
    ),
    state: {
      isLoading: isFetchinsBranches || isFetchingBranches,
      isSaving: isCreating || isUpdating || isDeleting,
      showAlertBanner: isGettingStaffError,
      showProgressBars: isCreating,
    },
  });

  return <MantineReactTable table={table} />;
};

export default function Staff() {
  return (
    <SideMenu>
      <Table />
    </SideMenu>
  );
}
