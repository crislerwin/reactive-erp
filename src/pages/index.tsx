import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideMenu } from "@/components/SideMenu";

import * as React from "react";
import { ChartComponent } from "@/components/SideMenu/Chart";

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
