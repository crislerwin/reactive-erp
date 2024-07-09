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
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { SideMenu } from "@/components/SideMenu";
import { type Staff as StaffType } from "@prisma/client";
import { trpc } from "@/utils/api";
import { MRT_Localization_PT_BR } from "mantine-react-table/locales/pt-BR";
import { createStaffMemberSchema } from "@/server/api/routers/staff/schemas";
import { type ZodError } from "zod";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";

function validateStaffMember(user: StaffType) {
  const errors: Record<string, string | undefined> = {};

  try {
    createStaffMemberSchema.parse({
      ...user,
      branch_id: Number(user.branch_id),
    });
  } catch (err) {
    const error = err as ZodError<StaffType>;
    if (error.errors) {
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
  const queryClient = useQueryClient();
  const {
    data: staffMembers = [],
    isFetching: isFetchingStaff,
    isError: isGettingStaffError,
  } = trpc.staff.findAll.useQuery(undefined, { refetchOnWindowFocus: false });
  const { mutate: createStaffMember, isLoading: isCreating } =
    trpc.staff.createStaffMember.useMutation();
  const { mutate: updateStaffMember, isLoading: isUpdating } =
    trpc.staff.updateStaffMember.useMutation();
  const { mutate: deleteStaffMember, isLoading: isDeleting } =
    trpc.staff.softDeletedStaffMember.useMutation();

  const { data: branches = [], isFetching: isFetchingBranches } =
    trpc.branch.findAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const columns = useMemo<MRT_ColumnDef<StaffType>[]>(
    () => [
      {
        accessorKey: "id",
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "first_name",
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
        accessorKey: "last_name",
        header: "Sobrenome",
        mantineEditTextInputProps: {
          type: "email",
          required: true,
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
      {
        accessorKey: "role",
        header: "Função",
        editVariant: "select",

        mantineEditSelectProps: {
          data: [
            { value: "ADMIN", label: "Administrador" },
            { value: "MANAGER", label: "Gerente" },
            { value: "EMPLOYEE", label: "Funcionario" },
          ],
          error: validationErrors?.state,
        },
      },
      {
        accessorKey: "branch_id",
        accessorFn: (originalRow) => String(originalRow.branch_id),
        header: "Filial",
        editVariant: "select",

        Cell(props) {
          const branch = branches.find(
            (branch) =>
              branch.branch_id === Number(props.row.original.branch_id)
          );
          return <div>{branch?.name}</div>;
        },
        mantineEditSelectProps: {
          data: branches.map((branch) => ({
            value: String(branch.branch_id),
            label: branch.name,
          })),
          error: validationErrors?.branch_id,
        },
      },
      {
        accessorKey: "active",
        accessorFn: (row) => {
          if (row.active === undefined) return "";
          return row.active ? "Sim" : "Não";
        },
        editVariant: "select",
        enableEditing: false,
        mantineEditSelectProps: {
          data: [
            { value: "true", label: "Sim" },
            { value: "false", label: "Não" },
          ],
        },
        header: "Ativo",
      },
    ],
    [branches, validationErrors]
  );
  const updateStaffListData = (
    newData: StaffType,
    variables: Partial<StaffType>
  ) =>
    queryClient.setQueryData<StaffType[] | undefined>(
      getQueryKey(trpc.staff.findAll, undefined, "query"),
      (oldData) => {
        if (!oldData) return;
        if (variables.id) {
          return oldData.map((data) =>
            data.id === variables.id ? newData : data
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

  const handleCreateUser: MRT_TableOptions<StaffType>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateStaffMember(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createStaffMember(
      { ...values, branch_id: Number(values.branch_id) },
      {
        onSuccess: updateStaffListData,
        onError: handleErrors,
      }
    );
    exitCreatingMode();
  };

  const handleSaveUser: MRT_TableOptions<StaffType>["onEditingRowSave"] = ({
    values,
    table,
  }) => {
    const newValidationErrors = validateStaffMember(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    updateStaffMember(
      {
        ...values,
        staff_id: Number(values.id),
        branch_id: Number(values.branch_id),
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
      title: "Deletar usuário",
      children: `Vocé tem certeza que quer deletar o usuàrio ${
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
    data: staffMembers,
    localization: MRT_Localization_PT_BR,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
    getRowId: ({ id }) => String(id),
    mantineToolbarAlertBannerProps: isFetchingStaff
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
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Criar novo</Title>
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
      const isActionDisabled =
        row.original.role === "OWNER" || !row.original.active;

      return (
        <>
          {isActionDisabled ? null : (
            <Flex gap="md">
              <Tooltip label="Editar">
                <ActionIcon onClick={() => table.setEditingRow(row)}>
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
          )}
        </>
      );
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="outline"
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Criar novo
      </Button>
    ),
    state: {
      isLoading: isFetchingStaff || isFetchingBranches,
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
