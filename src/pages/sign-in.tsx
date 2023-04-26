import { SignIn, useUser } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { NextPage } from "next";
import React from "react";

const SignInPage: NextPage = () => {
  const { isSignedIn } = useUser();

  return (
    <main className="min-h-screen flex-row justify-center bg-slate-700">
      {!isSignedIn && (
        <div className="m-10 flex justify-end">
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      )}
    </main>
  );
};

export default SignInPage;

export const getServerSideProps = (ctx: CreateNextContextOptions) => {
  const { userId } = getAuth(ctx.req);
  if (userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
