import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Company } from "@prisma/client";

import { CompanyForm } from "./Forms";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";

export const CompanyTable: React.FC = () => {
  const { data, isFetching } = trpc.company.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data || isFetching) return [];
    return data;
  }, [data, isFetching]);

  const columns = useMemo(
    (): MRT_ColumnDef<Company>[] => [
      {
        accessorKey: "fantasyName",
        header: "Nome Fantasia",
        size: 150,
      },
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
        accessorKey: "socialReason",
        header: "Razão Social",
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
              redirectTo={`/companies?companyId=${String(renderedCellValue)}`}
              label="Editar Empresa"
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
