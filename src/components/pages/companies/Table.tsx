import { IconTrash } from "@tabler/icons-react";
import React, { useMemo } from "react";
import { trpc } from "@/utils/api";
import { Table } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { type Company } from "@prisma/client";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { CompanyForm } from "./Forms";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";
import { EditModalFormWrapper } from "@/components/EditModalFormWrapper";

export const CompanyTable: React.FC = () => {
  const { mutate: handleDelete } = trpc.company.delete.useMutation();
  const router = useRouter();
  const [editOpen, { open: openEdit, close: closeEdit }] = useDisclosure(
    false,
    {
      onClose: () => {
        router.push("/companies").catch((err) => console.log(err));
      },
    }
  );

  const { data, isFetching } = trpc.company.findAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const tableData = useMemo(() => {
    if (!data) return [];
    return data;
  }, [data]);

  const context = trpc.useContext();
  const columns: MRT_ColumnDef<Company>[] = useMemo(
    () => [
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
        size: 80,
        Cell: (props) => {
          const { renderedCellValue } = props;
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
      {
        accessorKey: "id",
        header: "Excluir",
        size: 80,
        Cell: ({ renderedCellValue }) => {
          const selectedCompany = tableData.find(
            (company) => company.id === renderedCellValue
          );

          return (
            <ConfirmActionModal
              actionButton={{
                name: "Excluir",
                className: "bg-red-500 text-white hover:bg-red-600",
              }}
              title={`Deseja excluir a empresa ${
                selectedCompany?.fantasyName ?? ""
              }?`}
              handleConfirm={() => {
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
              <IconTrash className="h-4 w-4 hover:text-red-500" />
            </ConfirmActionModal>
          );
        },
      },
    ],
    [tableData, handleDelete, context.company.findAll]
  );

  return (
    <Table
      isLoading={isFetching}
      columns={columns as MRT_ColumnDef<Record<string, unknown>>[]}
      data={tableData}
    />
  );
};
