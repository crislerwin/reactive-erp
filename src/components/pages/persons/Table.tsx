import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Person } from "@prisma/client";

export const PersonTable: React.FC = () => {
  const { data, isFetching } = trpc.person.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

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
        header: "Editar",
        size: 150,
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
