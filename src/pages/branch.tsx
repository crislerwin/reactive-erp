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
import { customErrorHandler } from "@/common/errors/common";

type BranchPageProps = DefaultPageProps;

function Branch({ role, branch_id }: BranchPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const queryClient = useQueryClient();
  const { data: branches = [], isFetching: isFetchingBranches } =
    trpc.branch.findAll.useQuery(undefined, { refetchOnWindowFocus: false });
  const { mutate: createBranch, isLoading: isCreatingBranch } =
    trpc.branch.createBranch.useMutation();
  const { mutate: deleteBranch, isLoading: isDeletingBranch } =
    trpc.branch.deleteBranch.useMutation();
  const { mutate: updateBranch, isLoading: isUpdatingBranch } =
    trpc.branch.updateBranch.useMutation();
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
          error: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
      {
        accessorKey: "company_code",
        header: "CNPJ",
        mantineEditTextInputProps: {
          required: true,
          type: "number",
          error: validationErrors?.company_code,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              company_code: undefined,
            }),
        },
      },
      {
        accessorKey: "website",
        header: "Website",
        accessorFn(originalRow) {
          return originalRow.website || "";
        },
        mantineEditTextInputProps: {
          type: "text",
          error: validationErrors?.website,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              website: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );
  const updateBranchesData = (
    newData: BranchProps,
    variables: Partial<BranchProps>
  ) =>
    queryClient.setQueryData<BranchProps[] | undefined>(
      getQueryKey(trpc.branch.findAll, undefined, "query"),
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

  const handleCreateBranch: MRT_TableOptions<BranchProps>["onCreatingRowSave"] =
    ({ values, exitCreatingMode }) => {
      const newValidationErrors = validateData(values, createBranchSchema);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      createBranch(
        {
          website: values.website ? String(values.website) : undefined,
          company_code: String(values.company_code),
          name: String(values.name),
        },
        {
          onSuccess: (newData, variables) => {
            updateBranchesData(newData, variables);
            exitCreatingMode();
          },
          onError: (error) => {
            customErrorHandler({
              message: error.message,
              title: "Ops! Ocorreu um erro ao criar a filial",
            });
          },
        }
      );
    };

  const handleSaveBranch: MRT_TableOptions<BranchProps>["onEditingRowSave"] = ({
    values,
    exitEditingMode,
  }) => {
    const newValidationErrors = validateData(values, createBranchSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateBranch(
      {
        branch_id: Number(values.branch_id),
        website: values.website ? String(values.website) : undefined,
        company_code: values.company_code
          ? String(values.company_code)
          : undefined,
        name: values.name ? String(values.name) : undefined,
      },
      {
        onSuccess: (newData, variables) => {
          updateBranchesData(newData, variables);
          exitEditingMode();
        },
        onError: (error) => {
          customErrorHandler({
            message: error.message,
            title: "Ops! Ocorreu um erro ao salvar a filial",
          });
        },
      }
    );
  };

  const openDeleteConfirmModal = (row: MRT_Row<BranchProps>) => {
    modals.openConfirmModal({
      title: "Deletar Filial",
      children: `Vocé tem certeza que quer excluir a filial ${row.original.name}? Essa ação não pode ser desfeita.`,
      labels: { confirm: "Deletar", cancel: "Cancelar" },
      confirmProps: { variant: "filled", color: "red" },
      cancelProps: { variant: "outline" },
      onConfirm: () => {
        deleteBranch(
          { branch_id: row.original.branch_id },
          {
            onSuccess: () => {
              queryClient.setQueryData<BranchProps[] | undefined>(
                getQueryKey(trpc.branch.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return;
                  return oldData.filter(
                    (data) => data.branch_id !== row.original.branch_id
                  );
                }
              );
            },
            onError: (error) => {
              customErrorHandler({
                message: error.message,
                title: "Ops! Ocorreu um erro ao deletar a filial",
              });
            },
          }
        );
      },
    });
  };
  return (
    <SideMenu role={role}>
      <CustomTable
        addButtonLabel="Nova Filial"
        createModalLabel="Nova Filial"
        editModalLabel="Editar Filial"
        branch_id={branch_id}
        isLoading={
          isFetchingBranches ||
          isCreatingBranch ||
          isDeletingBranch ||
          isUpdatingBranch
        }
        openDeleteConfirmModal={openDeleteConfirmModal}
        tableOptions={{
          onCreatingRowSave: handleCreateBranch,
          onEditingRowSave: handleSaveBranch,
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
      branch_id: staffMember.branch_id,
      first_name: staffMember.first_name,
      last_name: staffMember.last_name,
    },
  };
}
