import * as React from "react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import dynamic from "next/dynamic";
import { SideMenu } from "@/components/SideMenu";
import { type DefaultPageProps } from "@/common/schemas";
import { createTRPCContext } from "@/server/api/trpc";
import { trpc } from "@/utils/api";
import { Box } from "@mantine/core";

const AreaChartComponent = dynamic(
  () => import("@/components/Charts/AreaChartComponent"),
  {
    ssr: false,
  }
);

const ChartComponent = dynamic(() => import("@/components/Charts/Chart"), {
  ssr: false,
});

type HomeProps = DefaultPageProps;

export default function Home({ role }: HomeProps) {
  const { data: chartData = [] } = trpc.report.getReports.useQuery();
  return (
    <SideMenu role={role}>
      <Box mb={4}>
        <ChartComponent data={chartData} />
      </Box>
      {/* <AreaChartComponent /> */}
    </SideMenu>
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
