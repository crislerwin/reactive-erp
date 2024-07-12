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
  DefaultPageProps,
  managerRoles,
} from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";

type StaffPageProps = DefaultPageProps;

function Staff({ role }: StaffPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const [isEditing, setIsEditing] = useState(false);
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
        Cell: ({ row }) => {
          return (
            <Switch
              labelPosition="left"
              label={row.original.active ? "Ativo" : "Inativo"}
              checked={row.original.active}
            />
          );
        },
        editVariant: "select",
        mantineEditSelectProps: {
          required: true,
          error: validationErrors?.active,
          data: [
            { value: "true", label: "Ativo" },
            { value: "false", label: "Inativo" },
          ],
        },

        header: "Status",
        error: validationErrors?.active,
      },
    ],
    [branches, isEditing, validationErrors]
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
    const newValidationErrors = validateData(values, createStaffMemberSchema);
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
  return (
    <SideMenu role={role}>
      <CustomTable
        columns={columns}
        data={staffMembers}
        tableOptions={{
          onCreatingRowSave: handleCreateUser,
          onEditingRowSave: handleSaveUser,
        }}
        openDeleteConfirmModal={openDeleteConfirmModal}
        isLoading={isFetchingStaff || isCreating || isUpdating || isDeleting}
        error={isGettingStaffError}
        enableEditing={!isEditing}
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
