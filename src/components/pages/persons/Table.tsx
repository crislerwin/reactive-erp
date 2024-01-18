import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { PersonForm } from "./Forms";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";
import { type updateProviderSchema } from "@/server/api/schemas";
import { type z } from "zod";

export const ProviderTable: React.FC = () => {
  const { data, isFetching } = trpc.provider.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data || isFetching) return [];
    return data;
  }, [data, isFetching]);
  console.log(tableData);
  const columns: MRT_ColumnDef<z.infer<typeof updateProviderSchema>>[] =
    useMemo(
      () => [
        {
          accessorKey: "first_name",
          header: "Nome",
          size: 150,
        },
        {
          accessorKey: "last_name",
          header: "Sobrenome",
          size: 150,
        },
        {
          accessorKey: "email",
          header: "Email",
          size: 150,
        },
        {
          accessorKey: "id",
          header: "Editar",
          size: 80,
          Cell: (props) => {
            const { renderedCellValue } = props;
            return (
              <EditModalFormWrapper
                label="Editar Pessoa"
                redirectTo={`/team?providerId=${String(renderedCellValue)}`}
              >
                {(close) => <PersonForm close={close} />}
              </EditModalFormWrapper>
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
