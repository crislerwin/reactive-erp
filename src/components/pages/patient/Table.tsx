import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Patient } from "@prisma/client";
import { PersonForm } from "./Forms";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";

export const PersonTable: React.FC = () => {
  const { data, isFetching } = trpc.patient.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data || isFetching) return [];
    return data;
  }, [data, isFetching]);

  const columns: MRT_ColumnDef<Patient>[] = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: "Nome",
        size: 150,
      },
      {
        accessorKey: "lastName",
        header: "Sobrenome",
        size: 150,
      },
      {
        accessorKey: "phoneNumber",
        header: "Telefone",
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
              redirectTo={`/persons?personId=${String(renderedCellValue)}`}
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
