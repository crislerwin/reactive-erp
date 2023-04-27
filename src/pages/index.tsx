import React from "react";
import type { NextPage } from "next";
import { useClerk, useUser } from "@clerk/nextjs";
import { api } from "@/utils/api";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";
import { SideBar } from "@/components/SideBar";

const Home: NextPage = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  api.persons.getLoggedUser.useQuery(undefined, {
    onError: (err) => {
      if (err && err.data?.code === "NOT_FOUND") {
        signOut().catch((err) => console.log(err));
      }
    },
  });

  return (
    <>
      {user && (
        <SideBar userName={user.fullName} avatarUrl={user.profileImageUrl} />
      )}
    </>
  );
};

export default Home;

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
