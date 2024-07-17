import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { SideMenu } from "@/components/SideMenu";
import { type Staff as StaffType } from "@prisma/client";
import { trpc } from "@/utils/api";
import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import CustomTable from "@/components/Table";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  updateStaffMemberSchema,
  createStaffMemberSchema,
  type DefaultPageProps,
} from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";
import { updateQueryData } from "@/lib";
import { managerRoles } from "@/common/constants";
import { validateData } from "@/common/utils";
import { Skeleton } from "@mantine/core";

type StaffPageProps = DefaultPageProps;

function Staff({ role }: StaffPageProps) {
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string | undefined>>();
  const {
    data: staffMembers = [],
    isLoading: isLoadingStaff,
    isError: isGettingStaffError,
  } = trpc.staff.findAll.useQuery();
  const { mutate: createStaffMember } =
    trpc.staff.createStaffMember.useMutation();
  const { mutate: updateStaffMember } =
    trpc.staff.updateStaffMember.useMutation();
  const { mutate: deleteStaffMember } =
    trpc.staff.softDeletedStaffMember.useMutation();

  const { data: branches = [] } = trpc.branch.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const columns = useMemo<MRT_ColumnDef<StaffType>[]>(
    () => [
      {
        accessorKey: "id",
        accessorFn: (row) => String(row.id ?? ""),
        header: "Id",
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: "first_name",
        accessorFn: (row) => row.first_name ?? "",
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
          type: "text",
          error: validationErrors?.last_name,
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        enableEditing: (row) => !row.original.email,
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
        accessorFn: (row) => row.role ?? "",
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
        accessorFn: (row) => String(row.branch_id ?? ""),
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
        accessorFn: (row) => String(Boolean(row.active)),
        header: "Status",
        Cell(props) {
          return <span>{props.row.original.active ? "Ativo" : "Inativo"}</span>;
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
      },
    ],
    [branches, validationErrors]
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
      onSuccess: (data) => {
        updateQueryData<StaffType[]>(
          getQueryKey(trpc.staff.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return [...oldData, data];
          }
        );
      },
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
        updateQueryData<StaffType[]>(
          getQueryKey(trpc.staff.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((staff) =>
              staff.id === data.id ? data : staff
            );
          }
        );
        table.setEditingRow(null);
      },
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
              updateQueryData<StaffType[]>(
                getQueryKey(trpc.staff.findAll, undefined, "query"),
                (data) => {
                  if (!data) return [];
                  return data.filter((staff) => staff.id !== row.original.id);
                }
              );
            },
          }
        ),
    });
  };

  return (
    <SideMenu role={role}>
      <Skeleton height="80vh" radius="xl" visible={isLoadingStaff}>
        {!isLoadingStaff && (
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
            isLoading={isLoadingStaff}
            error={isGettingStaffError}
          />
        )}
      </Skeleton>
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
