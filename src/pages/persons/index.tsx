import { type NextPage } from "next";
import { SideBar } from "@/components/SideBar";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import Home from "./home";

const Persons: NextPage = () => {
  return (
    <SideBar iconName="IconUsersGroup" label="Equipe">
      <Home />
    </SideBar>
  );
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
