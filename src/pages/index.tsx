import React from "react";
import type { NextPage } from "next";
import { SignOutButton } from "@clerk/nextjs";

import { api } from "@/utils/api";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getAuth } from "@clerk/nextjs/server";

const Home: NextPage = () => {
  const { data: user } = api.users.getLoggedUser.useQuery();

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {user ? (
          <div className="text-white">
            <h1 className="text-4xl font-bold">Welcome {user.userName}!</h1>
            <p className="text-xl">You are signed in.</p>

            <SignOutButton>
              <button className="btn">Sign out</button>
            </SignOutButton>
          </div>
        ) : (
          <></>
        )}
      </main>
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
