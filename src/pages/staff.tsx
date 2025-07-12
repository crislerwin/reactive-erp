import {
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
} from "mantine-react-table";

import { type Staff as StaffType } from "@prisma/client";
import { trpc } from "@/utils/api";
import { getQueryKey } from "@trpc/react-query";
import { CrudTable } from "@/design-system/Table";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import {
  updateStaffMemberSchema,
  createStaffMemberSchema,
  type DefaultPageProps,
} from "@/common/schemas";
import { updateQueryData } from "@/lib";
import { managerRoles } from "@/common/constants";
import { createTRPCContext } from "@/server/api/trpc";

type StaffPageProps = DefaultPageProps;

function Staff({ role }: StaffPageProps) {
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
    trpc.staff.softDeleteStaff.useMutation();

  const { data: branches = [] } = trpc.branch.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const columns: MRT_ColumnDef<StaffType>[] = [
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
      },
    },
    {
      accessorKey: "last_name",
      header: "Sobrenome",

      mantineEditTextInputProps: {
        type: "text",
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      enableEditing: (row) => !row.original.email,
      mantineEditTextInputProps: {
        type: "email",
        required: true,
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
      },
    },
    {
      accessorKey: "branch_id",
      header: "Filial",
      accessorFn: (row) => String(row.branch_id ?? ""),
      editVariant: "select",
      Cell(props) {
        const branch = branches.find(
          (branch) => branch.branch_id === Number(props.row.original.branch_id)
        );
        return <div>{branch?.name}</div>;
      },
      mantineEditSelectProps: {
        required: true,
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
        data: [
          { value: "true", label: "Ativo" },
          { value: "false", label: "Inativo" },
        ],
      },
    },
  ];

  const handleCreateUser: MRT_TableOptions<StaffType>["onCreatingRowSave"] = ({
    values,
    exitCreatingMode,
  }) => {
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

  const handleDeleteStaff = (row: MRT_Row<StaffType>) => {
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
    );
  };

  return (
    <CrudTable
      addButtonLabel="Novo Colaborador"
      createModalLabel="Novo Colaborador"
      editModalLabel="Editar Colaborador"
      columns={columns}
      data={staffMembers}
      hideActions={(row, action) => {
        if (action === "both") return row.original.role === "OWNER";
        return false;
      }}
      creationSchema={createStaffMemberSchema}
      updateSchema={updateStaffMemberSchema}
      onCreatingRowSave={handleCreateUser}
      deleteModalProps={(row) => ({
        title: "Deletar colaborador",
        labels: { confirm: "Deletar", cancel: "Cancelar" },
        children: `Deseja mesmo deletar o colaborador ${
          row.original.first_name
        } ${row.original.last_name ?? ""}`,
      })}
      onEditingRowSave={handleSaveUser}
      onConfirmDelete={handleDeleteStaff}
      isLoading={isLoadingStaff}
      error={isGettingStaffError}
    />
  );
}

export default Staff;

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
