import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Person } from "@prisma/client";
import { UnstyledButton } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { ConfirmationModal } from "@/components/ConfirmationModal";

export const PersonTable: React.FC = () => {
  const { data, isFetching } = trpc.person.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { mutate: handleDelete } = trpc.person.delete.useMutation();
  const context = trpc.useContext();

  const tableData = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  const columns: MRT_ColumnDef<Person>[] = useMemo(
    () => [
      {
        accessorKey: "userName",
        header: "Nome",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },
      {
        accessorKey: "personId",
        header: "Deletar",
        size: 150,
        Cell: ({ renderedCellValue }) => {
          const selectedPerson = tableData.find(
            (person) => person.personId === renderedCellValue
          );
          return (
            <ConfirmationModal
              actionButton={{
                name: "Excluir",
                className: "bg-red-500 text-white hover:bg-red-600",
              }}
              title={`Deseja excluir ${selectedPerson?.userName ?? ""}?`}
              handleConfirm={() => {
                handleDelete(
                  { personId: Number(renderedCellValue) },
                  {
                    onSuccess: () => {
                      context.person.findAll
                        .invalidate()
                        .catch((err) => console.log(err));
                    },
                  }
                );
              }}
            >
              <IconTrash className="h-4 w-4 hover:text-red-500" />
            </ConfirmationModal>
          );
        },
      },
    ],
    []
  );

  return (
    <Table
      isLoading={isFetching}
      columns={columns as MRT_ColumnDef<Record<string, unknown>>[]}
      data={tableData}
    />
  );
};
