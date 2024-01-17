import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { prisma } from "../../db";
import { type User } from "@prisma/client";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<User> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const clerkUser = await clerkClient.users.getUser(userId);
  const savedUser = await prisma.user.findUnique({
    where: { email: clerkUser.emailAddresses?.[0]?.emailAddress },
  });
  if (!savedUser) throw new TRPCError({ code: "UNAUTHORIZED" });
  return savedUser;
};
