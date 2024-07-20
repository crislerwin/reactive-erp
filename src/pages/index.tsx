import * as React from "react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import dynamic from "next/dynamic";
import { SideMenu } from "@/components/SideMenu";
import { type DefaultPageProps } from "@/common/schemas";
import { createTRPCContext } from "@/server/api/trpc";

const ChartComponent = dynamic(() => import("@/components/Chart"), {
  ssr: false,
});

type HomeProps = DefaultPageProps;

export default function Home({ role }: HomeProps) {
  return (
    <SideMenu role={role}>
      <ChartComponent />
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
