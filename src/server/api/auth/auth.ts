import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type User } from "@prisma/client";
import { prisma } from "@/server/db";

export const getServerAuthSession = async (
  ctx: CreateNextContextOptions
): Promise<User> => {
  const { userId } = getAuth(ctx.req);
  if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const clerkUser = await clerkClient.users.getUser(userId);

  const { primaryEmailAddressId } = clerkUser;
  if (!primaryEmailAddressId) throw new TRPCError({ code: "UNAUTHORIZED" });
  const primaryEmailAddress = await clerkClient.emailAddresses.getEmailAddress(
    primaryEmailAddressId
  );
  const { emailAddress } = primaryEmailAddress;

  const user = await prisma.user.findUnique({
    where: { email: emailAddress },
  });
  if (!user) {
    const newUser = await prisma.user.upsert({
      where: { email: emailAddress },
      update: {},
      create: {
        email: emailAddress,
        name: clerkUser.username,
        avatar_url: clerkUser.imageUrl,
      },
    });
    return newUser;
  }
  return user;
};
