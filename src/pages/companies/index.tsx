import { type NextPage } from "next";
import { IconBuilding } from "@tabler/icons-react";
import React from "react";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import Home from "./home";
import { Layout, type TabType } from "@/components/Layout";

const tabRoutes: TabType[] = [
  {
    icon: <IconBuilding size="0.8rem" />,
    label: "Empresas",
    href: "/companies",
  },
];

const pages = [
  {
    value: "/companies",
    page: <Home />,
  },
];
const Companies: NextPage = () => {
  return <Layout pages={pages} tabs={tabRoutes} />;
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
