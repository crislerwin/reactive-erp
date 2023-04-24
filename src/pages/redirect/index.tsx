import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";

const Redirect = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isSignedIn) router.push("/sign-in").catch((err) => console.error(err));
    if (isSignedIn && user) {
      router
        .push({
          pathname: "/redirect/[userId]",
          query: {
            userId: user.id,
            emailAddress: user.primaryEmailAddress?.emailAddress,
          },
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [isSignedIn, router, user]);

  return <></>;
};

export default Redirect;
