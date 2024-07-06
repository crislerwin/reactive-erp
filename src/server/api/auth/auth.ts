import { prisma } from "@/server/db";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { type Account } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<Account> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const { emailAddresses } = await clerkClient.users.getUser(userId);
  const [firstEmailAddress] = emailAddresses;
  if (!firstEmailAddress)
    throw new TRPCError({ code: "BAD_REQUEST", cause: "Email is not defined" });
  const account = prisma.account.findUniqueOrThrow({
    where: { email: firstEmailAddress.emailAddress },
  });
  return account;
};
