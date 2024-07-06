import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { SideBar } from "@/components/SideBar";

const Home = () => {
  return <SideBar>HEllo</SideBar>;
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
