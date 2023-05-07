import { type NextPage } from "next";
import { type PageType, Layout, type TabType } from "@/components/Layout";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { IconUser } from "@tabler/icons-react";
import AccountPage from "./[userId]";

const pages: PageType[] = [
  {
    element: <AccountPage />,
    value: "/account",
  },
];
const tabs: TabType[] = [
  {
    label: "Conta",
    href: "/account",
    icon: <IconUser size="0.8rem" />,
  },
];
const Profile: NextPage = () => {
  return <Layout pages={pages} tabs={tabs} />;
};

export default Profile;

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
