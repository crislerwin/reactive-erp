import { SignIn, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";

const SignInPage: NextPage = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isSignedIn) {
      router.push("/redirect").catch((err) => {
        console.error(err);
      });
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex justify-center">
      {!isSignedIn && (
        <div className="p-4">
          <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
        </div>
      )}
    </div>
  );
};

export default SignInPage;
