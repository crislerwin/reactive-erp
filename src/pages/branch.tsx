import { useMemo, useState } from "react";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";
import { type Branch } from "@prisma/client";

import { modals } from "@mantine/modals";
import { getQueryKey } from "@trpc/react-query";
import { trpc } from "@/utils/api";
import { SideMenu } from "@/components/SideMenu";
import CustomTable from "@/components/Table";
import { validateData } from "@/common/utils";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { createBranchSchema, type DefaultPageProps } from "@/common/schemas";
import { getServerAuthSession } from "@/server/api/auth";
import { updateQueryData } from "@/lib";
import { managerRoles } from "@/common/constants";
import { Skeleton } from "@mantine/core";
import { prisma } from "@/server/db";
import { createTRPCContext } from "@/server/api/trpc";

type BranchPageProps = DefaultPageProps;

function BranchPage({ role, branch_id }: BranchPageProps) {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const { data: branches = [], isLoading: isLoadingBranches } =
    trpc.branch.findAll.useQuery();
  const { mutate: createBranch } = trpc.branch.createBranch.useMutation();
  const { mutate: deleteBranch } = trpc.branch.deleteBranch.useMutation();
  const { mutate: updateBranch } = trpc.branch.updateBranch.useMutation();

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
          error: validationErrors?.name,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              name: undefined,
            }),
        },
      },
    ],
    [validationErrors]
  );

  const handleCreateBranch: MRT_TableOptions<Branch>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateData(values, createBranchSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    createBranch(values, {
      onSuccess: (newData) => {
        updateQueryData<Branch[]>(
          getQueryKey(trpc.branch.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return [...oldData, newData];
          }
        );
        exitCreatingMode();
      },
    });
  };

  const handleSaveBranch: MRT_TableOptions<Branch>["onEditingRowSave"] = ({
    values,
    exitEditingMode,
  }) => {
    const newValidationErrors = validateData(values, createBranchSchema);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    updateBranch(values, {
      onSuccess: (newData, variables) => {
        updateQueryData<Branch[]>(
          getQueryKey(trpc.branch.findAll, undefined, "query"),
          (oldData) => {
            if (!oldData) return [];
            return oldData.map((data) =>
              data.branch_id === variables.branch_id ? newData : data
            );
          }
        );
        exitEditingMode();
      },
    });
  };

  const openDeleteConfirmModal = (row: MRT_Row<Branch>) => {
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
              updateQueryData<Branch[]>(
                getQueryKey(trpc.branch.findAll, undefined, "query"),
                (oldData) => {
                  if (!oldData) return [];
                  return oldData.filter(
                    (branch) => branch.branch_id !== row.original.branch_id
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
      <Skeleton height="80vh" radius="xl" visible={isLoadingBranches}>
        {!isLoadingBranches && (
          <CustomTable
            addButtonLabel="Nova Filial"
            createModalLabel="Nova Filial"
            editModalLabel="Editar Filial"
            branch_id={branch_id}
            isLoading={isLoadingBranches}
            openDeleteConfirmModal={openDeleteConfirmModal}
            tableOptions={{
              onCreatingRowSave: handleCreateBranch,
              onEditingRowSave: handleSaveBranch,
            }}
            columns={columns}
            data={branches}
          />
        )}
      </Skeleton>
    </SideMenu>
  );
}
export default BranchPage;

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
