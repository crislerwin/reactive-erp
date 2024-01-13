import { type User, clerkClient, getAuth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<User> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const user = await clerkClient.users.getUser(userId);

  return user;
};
