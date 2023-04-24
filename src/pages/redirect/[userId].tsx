import { useRouter } from "next/router";
import React from "react";
import { api } from "../../utils/api";
import { useClerk } from "@clerk/nextjs";

const Redirect = () => {
  const router = useRouter();
  const { userId, emailAddress } = router.query;
  const { signOut } = useClerk();
  const {
    getUser: { useQuery },
  } = api.users;
  const { error, isLoading } = useQuery(
    { email: String(emailAddress), userId: String(userId) },
    {
      enabled: !!emailAddress,
      retry: false,
      onError: () => {
        signOut().catch((err) => console.error(err));
      },
      onSuccess: () => {
        router.push("/").catch((err) => console.error(err));
      },
    }
  );

  return (
    <>
      {isLoading && <div>Carregando</div>}
      {error && (
        <div>
          <h3>
            Nao conseguimos encontrar o nenhum usuario com o email{" "}
            {emailAddress}
          </h3>
        </div>
      )}
    </>
  );
};

export default Redirect;
