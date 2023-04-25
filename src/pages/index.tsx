import React from "react";
import type { NextPage } from "next";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { api } from "@/utils/api";

const Home: NextPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { data } = api.staff.getAll.useQuery();

  React.useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in").catch((err) => {
        console.error(err);
      });
    }
  }, [isLoaded, router, user]);

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        {user ? (
          <div className="text-white">
            <h1 className="text-4xl font-bold">Welcome {user.fullName}!</h1>
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
