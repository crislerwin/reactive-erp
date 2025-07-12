import * as React from "react";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import dynamic from "next/dynamic";

import type { DefaultPageProps } from "@/common/schemas";
import { createTRPCContext } from "@/server/api/trpc";
import { trpc } from "@/utils/api";
import { Box, Skeleton } from "@mantine/core";

const ChartComponent = dynamic(() => import("@/components/Charts/Chart"), {
  ssr: false,
});

type HomeProps = DefaultPageProps;

export default function Home({}: HomeProps) {
  const { data: chartData = [], isLoading } = trpc.report.getReports.useQuery();
  return (
    <Box mb={4}>
      {isLoading ? (
        <Skeleton height={300} />
      ) : (
        <ChartComponent data={chartData} />
      )}
    </Box>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const { session } = await createTRPCContext(ctx);
  const { staffMember, user } = session;
  if (!user) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  if (!staffMember) {
    return {
      redirect: {
        destination: "/unauthorized",
        permanent: false,
      },
    };
  }

  return {
    props: {
      email: staffMember.email,
      role: staffMember.role,
      id: staffMember.id,
    },
  };
}
