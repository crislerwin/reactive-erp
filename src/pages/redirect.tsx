import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import React from "react";
import { api } from "../utils/api";

const UserComponent: React.FC<{
  userId: string | undefined;
  emailAddress: string | undefined;
}> = ({ emailAddress = "", userId = "" }) => {
  const router = useRouter();
  const {
    getUser: { useQuery },
    updateUser: { useMutation },
  } = api.users;
  const { data, error, isLoading } = useQuery(
    { email: emailAddress },
    {
      enabled: !!emailAddress,
    }
  );

  const { mutate } = useMutation();

  React.useEffect(() => {
    if (error) {
      router.push("/unauthorized").catch((err) => {
        console.error(err);
      });
      return;
    }
    if (data && !isLoading && !data.userId) {
      mutate(
        {
          email: emailAddress,
          userId: userId,
        },
        {
          onSuccess: () => {
            router.push("/").catch((err) => {
              console.error(err);
            });
          },
        }
      );
    } else if (data && !isLoading && data.userId) {
      router.push("/").catch((err) => {
        console.error(err);
      });
    }
  }, [data, mutate, emailAddress, userId, router, isLoading]);
  return <></>;
};

const Redirect = () => {
  const router = useRouter();
  const { user } = useUser();

  React.useEffect(() => {
    if (!user) {
      router.push("/sign-in").catch((err) => {
        console.error(err);
      });
    }
  }, [user, router]);

  return (
    <>
      {user && (
        <UserComponent
          userId={user.id}
          emailAddress={user.primaryEmailAddress?.emailAddress}
        />
      )}
    </>
  );
};

export default Redirect;
