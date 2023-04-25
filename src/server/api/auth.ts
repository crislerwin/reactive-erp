import { clerkClient, getAuth, buildClerkProps } from "@clerk/nextjs/server";
import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);

  const user = userId ? await clerkClient.users.getUser(userId) : undefined;

  return { props: { ...buildClerkProps(ctx.req, { user }) } };
};
