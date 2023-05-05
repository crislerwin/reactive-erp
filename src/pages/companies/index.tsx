import { type NextPage } from "next";
import { IconBuilding } from "@tabler/icons-react";
import React from "react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { Home } from "./home";
import { SideBar, type TabType } from "@/components/SideBar";

const tabRoutes: TabType[] = [
  {
    icon: <IconBuilding size="0.8rem" />,
    label: "Empresas",
    route: "/companies",
  },
];

const pages = [
  {
    value: "/companies",
    page: <Home />,
  },
];
const Companies: NextPage = () => {
  return <SideBar pages={pages} tabs={tabRoutes} />;
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
