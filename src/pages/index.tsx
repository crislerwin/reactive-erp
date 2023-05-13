import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type PageType, SideBar, type TabType } from "@/components/SideBar";
import { useUser } from "@clerk/nextjs";

const pages: PageType[] = [];

const tabs: TabType[] = [];

const Home = () => {
  const { user } = useUser();
  if (!user) return <></>;

  return <SideBar pages={pages} tabs={tabs} />;
};
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

export default Home;
