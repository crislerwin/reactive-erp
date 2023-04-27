import React from "react";
import type { NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { SideBar } from "@/components/SideBar";

const DashBoard: NextPage = () => {
  const { user } = useUser();

  if (!user) return <></>;

  return <SideBar />;
};

export default DashBoard;

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
