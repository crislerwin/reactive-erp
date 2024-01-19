import { SideBar } from "@/components/SideBar";
import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { useMemo } from "react";
import { MantineTable } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";
import { trpc } from "@/utils/api";
const Companies = () => {
  const { data: tableData, isFetching } = trpc.institution.findAll.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    }
  );
  const columns = useMemo(
    (): MRT_ColumnDef<Record<string, unknown>>[] => [
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
    ],
    []
  );
  return (
    <SideBar>
      <div className="flex flex-col">
        <div className="mt-4 rounded-sm">
          <MantineTable
            isLoading={isFetching}
            columns={columns}
            data={tableData ?? []}
          />
        </div>
      </div>
    </SideBar>
  );
};
export default Companies;

export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (userId) {
    return {
      props: {},
    };
  }
  return {
    redirect: {
      destination: "/sign-in",
      permanent: false,
    },
  };
};
