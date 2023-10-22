import { type User } from "@clerk/nextjs/dist/api";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<{ user: User | null }> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) return { user: null };
  const user = await clerkClient.users.getUser(userId);

  return { user };
};
