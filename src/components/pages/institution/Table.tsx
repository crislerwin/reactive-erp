import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Institution } from "@prisma/client";
import { CompanyForm } from "./Forms";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";

export const CompanyTable: React.FC = () => {
  const { data, isFetching } = trpc.institution.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data || isFetching) return [];
    return data;
  }, [data, isFetching]);

  const columns = useMemo(
    (): MRT_ColumnDef<Institution>[] => [
      {
        accessorKey: "name",
        header: "Nome da Instituição",
        size: 150,
      },
      {
        accessorKey: "company_code",
        header: "CNPJ",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 150,
      },

      {
        accessorKey: "additional_info.description",
        header: "Descrição",
        size: 150,
      },
      {
        accessorKey: "id",
        header: "Editar",
        enableColumnOrdering: false,
        size: 80,
        Cell: ({ renderedCellValue }) => {
          return (
            <EditModalFormWrapper
              redirectTo={`/institutions?institutionId=${String(
                renderedCellValue
              )}`}
              label="Editar Instituição"
            >
              {(close) => <CompanyForm close={close} />}
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
