import { trpc } from "@/utils/api";
import { SideBar } from "@/components/SideBar";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";

import React, { useMemo } from "react";
import { MantineTable } from "@/components/Table";
import { type MRT_ColumnDef } from "mantine-react-table";

export default function Provider() {
  const { data: providers, isFetching: isFetchingProviders } =
    trpc.provider.findAll.useQuery(undefined, { refetchOnWindowFocus: false });

  const columns: MRT_ColumnDef<Record<string, unknown>>[] = useMemo(
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
      },
    ],
    []
  );

  return (
    <SideBar>
      <div className="flex flex-col">
        <div className="mt-4 rounded-sm">
          <MantineTable
            enableGrouping
            state={{ isLoading: isFetchingProviders }}
            columns={columns}
            data={providers ?? []}
          />
        </div>
      </div>
    </SideBar>
  );
}

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
