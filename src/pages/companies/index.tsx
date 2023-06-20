import { type NextPage } from "next";
import React from "react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import Home from "./home";
import { SideBar } from "@/components/SideBar";

const Companies: NextPage = () => {
  return (
    <SideBar iconName="IconBuilding" label="Empresas">
      <Home />
    </SideBar>
  );
};

export default Companies;

export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
