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
import { buttonVariant, Table } from "@/design-system";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  createBranchSchema,
  updateBranchSchema,
  type DefaultPageProps,
} from "@/common/schemas";
import { updateQueryData } from "@/lib";
import { createTRPCContext } from "@/server/api/trpc";

type BranchPageProps = DefaultPageProps;

function BranchPage({ role }: BranchPageProps) {
  const { data: branches = [], isLoading: isLoadingBranches } =
    trpc.branch.findAll.useQuery();
  const { mutate: createBranch } = trpc.branch.createBranch.useMutation();
  const { mutate: deleteBranch } = trpc.branch.deleteBranch.useMutation();
  const { mutate: updateBranch } = trpc.branch.updateBranch.useMutation();

  const columns: MRT_ColumnDef<Branch>[] = [
    {
      accessorKey: "branch_id",
      header: "Id",
      enableEditing: false,
    },
    {
      accessorKey: "name",
      header: "Nome",
      mantineEditTextInputProps: {
        type: "text",
        required: true,
      },
    },
  ];

  const handleCreateBranch: MRT_TableOptions<Branch>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
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
      confirmProps: {
        variant: "filled",
        className: buttonVariant({ color: "danger" }),
      },
      cancelProps: {
        variant: "outline",
        className: buttonVariant(),
      },
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
      <Table
        addButtonLabel="Nova Filial"
        createModalLabel="Nova Filial"
        editModalLabel="Editar Filial"
        isLoading={isLoadingBranches}
        onCreatingRowSave={handleCreateBranch}
        onEditingRowSave={handleSaveBranch}
        creationSchema={createBranchSchema}
        updateSchema={updateBranchSchema}
        openDeleteConfirmModal={openDeleteConfirmModal}
        columns={columns}
        data={branches}
      />
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
