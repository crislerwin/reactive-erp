import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Provider } from "@prisma/client";
import { PersonForm } from "./Forms";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";

export const ProviderTable: React.FC = () => {
  const { data, isFetching } = trpc.provider.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data || isFetching) return [];
    return data;
  }, [data, isFetching]);

  const columns: MRT_ColumnDef<Provider>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Nome",
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
              redirectTo={`/teams?providerId=${String(renderedCellValue)}`}
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
