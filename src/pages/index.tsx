import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { Layout } from "@/components/Layout";
import { useUser } from "@clerk/nextjs";

const Home = () => {
  const { user } = useUser();
  if (!user) return <></>;

  return <Layout />;
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
