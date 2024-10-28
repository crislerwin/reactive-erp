import { clerkClient, getAuth, type User } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<User | null> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return null;
  return clerkClient.users.getUser(userId);
};
