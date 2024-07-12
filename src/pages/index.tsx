import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideMenu } from "@/components/SideMenu";

const ChartComponent = dynamic(() => import("@/components/Chart"), {
  ssr: false,
});

type HomeProps = DefaultPageProps;

import * as React from "react";
import dynamic from "next/dynamic";
import { getServerAuthSession } from "@/server/api/auth";
import { type DefaultPageProps } from "@/common/schemas";

export default function Home({ role }: HomeProps) {
  return (
    <SideMenu role={role}>
      <ChartComponent />
    </SideMenu>
  );
}

export async function getServerSideProps(ctx: CreateNextContextOptions) {
  const staffMember = await getServerAuthSession(ctx);
  if (!staffMember) {
    return {
      redirect: {
        destination: "/sign-in",
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
