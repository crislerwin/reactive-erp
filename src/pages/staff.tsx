import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@mantine/core";
import { SideMenu } from "@/components/SideMenu";
import { type Staff as StaffType } from "@prisma/client";
import { trpc } from "@/utils/api";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import CustomTable from "@/components/Table";
import { validateData } from "@/components/Table/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  updateStaffMemberSchema,
  createStaffMemberSchema,
  type DefaultPageProps,
  managerRoles,
} from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";
import { customErrorHandler } from "@/common/errors/common";

type StaffPageProps = DefaultPageProps;

function Staff({ role }: StaffPageProps) {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();

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
          type: "email",
          error: validationErrors?.last_name,
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
          required: true,
          data: [
            { value: "ADMIN", label: "Administrador" },
            { value: "MANAGER", label: "Gerente" },
            { value: "EMPLOYEE", label: "Funcionario" },
          ],
          error: validationErrors?.role,
        },
      },
      {
        accessorKey: "branch_id",
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
          required: true,
          error: validationErrors?.branch_id,
          data: branches.map((branch) => ({
            value: String(branch.branch_id),
            label: branch.name,
          })),
        },
      },
      {
        accessorKey: "active",
        accessorFn: (row) => String(row.active),
        header: "Status",
        editVariant: "select",
        mantineEditSelectProps: {
          required: true,
          error: validationErrors?.active,
          data: [
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" },
          ],
        },
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

  const handleCreateUser: MRT_TableOptions<StaffType>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateData(values, createStaffMemberSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    createStaffMember(values, {
      onSuccess: updateStaffListData,
      onError: (err) =>
        customErrorHandler({
          title: "Ops! Ocorreu um erro ao criar o colaborador",
          message: err.message,
        }),
    });
    exitCreatingMode();
  };

  const handleSaveUser: MRT_TableOptions<StaffType>["onEditingRowSave"] = ({
    values,
    table,
  }) => {
    const newValidationErrors = validateData(values, updateStaffMemberSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateStaffMember(values, {
      onSuccess: (data) => {
        updateStaffListData(data, { id: Number(data.id) });
        table.setEditingRow(null);
      },
      onError: (err) =>
        customErrorHandler({
          title: "Ops! Ocorreu um erro ao editar o colaborador",
          message: err.message,
        }),
    });
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
            onError: (err) =>
              customErrorHandler({
                title: "Ops! Ocorreu um erro ao deletar o colaborador",
                message: err.message,
              }),
          }
        ),
    });
  };
  return (
    <SideMenu role={role}>
      <CustomTable
        addButtonLabel="Novo Colaborador"
        createModalLabel="Novo Colaborador"
        editModalLabel="Editar Colaborador"
        columns={columns}
        data={staffMembers}
        tableOptions={{
          onCreatingRowSave: handleCreateUser,
          onEditingRowSave: handleSaveUser,
        }}
        openDeleteConfirmModal={openDeleteConfirmModal}
        isLoading={
          isFetchingStaff ||
          isCreating ||
          isUpdating ||
          isDeleting ||
          isFetchingBranches
        }
        error={isGettingStaffError}
      />
    </SideMenu>
  );
}
export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const staffMember = await getServerAuthSession(ctx);
  if (!staffMember) {
    return {
      redirect: {
        destination: "/sign-in",
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

export default Staff;
