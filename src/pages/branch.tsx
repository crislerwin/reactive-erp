import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { useQueryClient } from "@tanstack/react-query";
import { type Branch as BranchProps } from "@prisma/client";

import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import CustomTable from "@/components/Table";
import { validateData } from "@/components/Table/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  createBranchSchema,
  managerRoles,
  type DefaultPageProps,
} from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";

type BranchPageProps = DefaultPageProps;

function Branch({ role }: BranchPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();
  const { data: branches = [], isFetching: isFetchinsBranches } =
    trpc.branch.findAll.useQuery(undefined, { refetchOnWindowFocus: false });
  const { mutate: createStaffMember, isLoading: isCreating } =
    trpc.branch.createBranch.useMutation();

  const columns = useMemo<MRT_ColumnDef<BranchProps>[]>(
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
    [validationErrors]
  );
  const updateStaffListData = (
    newData: BranchProps,
    variables: Partial<BranchProps>
  ) =>
    queryClient.setQueryData<BranchProps[] | undefined>(
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

  const handleCreateUser: MRT_TableOptions<BranchProps>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
      const newValidationErrors = validateData(values, createBranchSchema);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      createStaffMember(
        {
          email: String(values.email),
          company_code: String(values.company_code),
          name: String(values.name),
        },
        {
          onSuccess: (newData, variables) => {
            updateStaffListData(newData, variables);
            exitCreatingMode();
          },
          onError: handleErrors,
        }
      );
    };

  const handleSaveUser: MRT_TableOptions<BranchProps>["onEditingRowSave"] = ({
    values,
    table,
  }) => {
    console.log({ table, values });
  };

  const openDeleteConfirmModal = (row: MRT_Row<BranchProps>) => {
    modals.openConfirmModal({
      title: "Deletar Filial",
      children: `Vocé tem certeza que quer excluir a filial ${row.original.name}? Essa ação não pode ser desfeita.`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { variant: "filled", color: "red" },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        console.log("deletar");
      },
    });
  };
  return (
    <SideMenu role={role}>
      <CustomTable
        isLoading={isFetchinsBranches}
        openDeleteConfirmModal={openDeleteConfirmModal}
        tableOptions={{
          onCreatingRowSave: handleCreateUser,
          onEditingRowSave: handleSaveUser,
        }}
        columns={columns}
        data={branches}
      />
    </SideMenu>
  );
}
export default Branch;

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
