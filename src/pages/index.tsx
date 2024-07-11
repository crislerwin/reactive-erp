import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideMenu } from "@/components/SideMenu";

const ChartComponent = dynamic(() => import("@/components/Chart"), {
  ssr: false,
});

import * as React from "react";
import dynamic from "next/dynamic";

const Home = () => {
  return (
    <SideMenu>
      <ChartComponent />
    </SideMenu>
  );
};

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

export default Home;
