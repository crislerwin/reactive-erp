import { IconTrash } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Company } from "@prisma/client";
import { UnstyledButton } from "@mantine/core";

export const CompanyTable: React.FC = () => {
  const { mutate: handleDelete } = trpc.company.delete.useMutation();
  const { data, isFetching } = trpc.company.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const context = trpc.useContext();
  const columns: MRT_ColumnDef<Company>[] = useMemo(
    () => [
      {
        accessorKey: "cnpj",
        header: "CNPJ",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },
      {
        accessorKey: "fantasyName",
        header: "Nome Fantasia",
        size: 150,
      },
      {
        accessorKey: "socialReason",
        header: "Razão Social",
        size: 150,
      },
      {
        accessorKey: "id",
        header: "Excluir",
        size: 150,
        Cell: (props) => {
          const { renderedCellValue } = props;
          return (
            <UnstyledButton
              className="cursor-pointer hover:text-red-500"
              onClick={() => {
                handleDelete(
                  { companyId: Number(renderedCellValue) },
                  {
                    onSuccess: () => {
                      context.company.findAll
                        .invalidate()
                        .catch((err) => console.log(err));
                    },
                  }
                );
              }}
            >
              <IconTrash className="h-4 w-4" />
            </UnstyledButton>
          );
        },
      },
    ],
    [context.company.findAll, handleDelete]
  );

  const tableData = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);
  return (
    <Table
      isLoading={isFetching}
      columns={columns as MRT_ColumnDef<Record<string, unknown>>[]}
      data={tableData}
    />
  );
};
