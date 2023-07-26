import { clerkClient, getAuth } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export type User = {
  id: string | null;
  userName: string | null;
  emailAddress?: string;
  isSuper?: boolean | null;
  createdAt: number;
  updatedAt: number;
};

const authorizedMails: string[] = ["crislerwintler@gmail.com"];

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<{ user: User | null }> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { user: null };
  const cUser = await clerkClient.users.getUser(userId);
  const userName =
    cUser.firstName && cUser.lastName
      ? `${cUser.firstName} ${cUser.lastName}`
      : cUser.username;
  const isSuper = cUser.emailAddresses[0]?.emailAddress
    ? authorizedMails.includes(cUser.emailAddresses[0]?.emailAddress)
    : null;
  const user: User = {
    id: cUser.id,
    userName: userName,
    isSuper,
    emailAddress: cUser.emailAddresses[0]?.emailAddress,
    createdAt: cUser.createdAt,
    updatedAt: cUser.updatedAt,
  };
  return { user };
};
