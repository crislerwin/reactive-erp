import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<{ user: User | null }> => {
  const { userId } = getAuth(ctx.req);
  const user = userId ? await clerkClient.users.getUser(userId) : null;
  return { user };
};
