import { type NextPage } from "next";
import { type PageType, Layout, type TabType } from "@/components/Layout";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import Home from "./home";
import { IconUsersGroup } from "@tabler/icons-react";

const pages: PageType[] = [
  {
    page: <Home />,
    value: "/persons",
  },
];

const tabRoutes: TabType[] = [
  {
    label: "Equipe",
    href: "/persons",
    icon: <IconUsersGroup size="0.8rem" />,
  },
];

const Persons: NextPage = () => {
  return <Layout pages={pages} tabs={tabRoutes} />;
};

export default Persons;

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
