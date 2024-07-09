import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideBar } from "@/components/SideBar";

import * as React from "react";
import { ChartComponent } from "@/components/SideBar/Chart";

const Home = () => {
  return (
    <SideBar>
      <ChartComponent />
    </SideBar>
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
